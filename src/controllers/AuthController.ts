import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  Body,
  CurrentUser,
  Get,
  JsonController,
  Patch,
  Post,
  Res,
} from "routing-controllers";
import { USERNAME_UPDATE_POINTS } from "../constants/points";
import { User } from "../entity/User";
import AuthService from "../service/AuthService";
import PointsServices from "../service/PointsServices";
import { AppUser, Provider } from "../types/Auth";

class LoginBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

class RegisterBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  names: string;
}

class ForgotPasswordBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

class ResetPasswordBody {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}

class ChangePasswordBody {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

class RefreshTokenBody {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

class UpdateProfileBody {
  @IsOptional()
  @IsString()
  names?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

class AuthSigninBody {
  @IsNotEmpty()
  @IsString()
  token: string;

  platform: "web" | "android" | "ios";

  @IsOptional()
  principal?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  provider?: Provider;

  @IsString()
  @IsOptional()
  names: string;

  @IsEmail()
  @IsOptional()
  email: string;
}

@JsonController("/api/auth")
export class AuthController {
  @Post("/refresh-token")
  async refreshToken(
    @Body({ required: false, validate: true }) body: RefreshTokenBody
  ) {
    // refresh token logic
    const { refresh_token: token } = body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };

      const user = await User.findOneBy({
        id: decoded.id,
      });

      if (!user)
        throw new BadRequestError(
          "Invalid or expired token. Please login again"
        );

      const userData = {
        id: user.id,
        email: user.email,
        names: user.names,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        profilePictureUrl: user.profilePictureUrl,
      };

      // generate access and refresh tokens
      const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "3d",
      });

      const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      return { ...userData, access_token, refresh_token };
    } catch (error: any) {
      if (error)
        throw new BadRequestError(
          error["message"] || "Invalid or expired token. Please login again"
        );
    }
  }

  @Patch("/update-profile")
  async updateProfile(
    @Body({ required: false, validate: true }) body: UpdateProfileBody,
    @CurrentUser({ required: true }) appUser: AppUser
  ) {
    // update profile logic
    const {
      names,
      email,
      phoneNumber,
      location,
      bio,
      profilePictureUrl,
      username,
    } = body;

    const data: Record<string, string | boolean> = {};

    if (names) data.names = names;
    if (email) data.email = email;
    if (phoneNumber) data.phoneNumber = phoneNumber;
    if (location) data.location = location;
    if (bio) data.bio = bio;
    if (profilePictureUrl) data.profilePictureUrl = profilePictureUrl;
    if (username) {
      data.username = username;
      const usernameExist = await User.existsBy({ username });
      if (usernameExist)
        return new BadRequestError("Username is already taken");

      if (appUser?.sub) {
        const pointsService = new PointsServices();
        pointsService.increaseUserPoints({
          sub: appUser.sub,
          points: USERNAME_UPDATE_POINTS,
        });
      }
    }

    await User.update(appUser.id, data);

    return {
      message: "Profile updated successfully.",
    };
  }

  /*
   *
   * @deprecated
   * /google-signin
   * Please use /signin instead
   */
  @Post("/google-signin")
  async googleSignin(@Body() body: AuthSigninBody, @Res() res: Response) {
    const { token, platform } = body;

    if (!platform) {
      throw new BadRequestError("Platform is required");
    }

    // check if platform is android or ios
    if (!["android", "ios", "web"].includes(platform)) {
      throw new BadRequestError("Invalid platform");
    }

    const ANDROID_CLIENT_ID = process.env.WEB_GOOGLE_CLIENT_ID;
    const WEB_CLIENT_ID = process.env.WEB_GOOGLE_CLIENT_ID;
    const IOS_CLIENT_ID = process.env.IOS_GOOGLE_CLIENT_ID;

    const clientId = {
      android: ANDROID_CLIENT_ID,
      ios: IOS_CLIENT_ID,
      web: WEB_CLIENT_ID,
    }[platform];

    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestError("Invalid Google token");

    const user = await User.findOneBy({
      email: payload.email,
    });

    if (!user) {
      const newUser = new User();

      if (!payload.email) throw new BadRequestError("Email is required");

      newUser.email = payload.email || "";
      newUser.names = payload.name || "";
      newUser.profilePictureUrl = payload.picture || "";
      newUser.username = body.username || "";
      newUser.provider = "google";

      if (body.principal) newUser.principal = body.principal;

      /**
       *
       * If the user does not have username, means their info data
       * Is accepted but not ready to be saved until user sends username as well.
       *
       */
      if (!newUser.username) {
        return res.status(202).json({
          message: "User info has been accepted for processing.",
        });
      }
      await newUser.save();

      const userData = {
        id: newUser.id,
        email: newUser.email,
        names: newUser.names,
        phoneNumber: newUser.phoneNumber,
        emailVerified: newUser.emailVerified,
        provider: newUser.provider,
        profilePictureUrl: newUser.profilePictureUrl,
        username: newUser.username,
        points: 0,
        sub: payload.sub,
      };

      // generate access and refresh tokens
      const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "3d",
      });

      const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      return { ...userData, access_token, refresh_token };
    }

    if (body.principal) {
      user.principal = body.principal;
      await user.save();
    }

    const userData = {
      id: user.id,
      email: user.email,
      names: user.names,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      provider: user.provider,
      profilePictureUrl: user.profilePictureUrl,
      username: user.username,
      sub: payload.sub,
    };

    // generate access and refresh tokens
    const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "3d",
    });

    const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const pointsService = new PointsServices();
    pointsService.registerUserOnCanister({ sub: payload.sub });

    return { ...userData, access_token, refresh_token };
  }

  @Post("/signin")
  async signin(@Body() body: AuthSigninBody, @Res() res: Response) {
    const { token, platform } = body;

    if (!platform) {
      throw new BadRequestError("Platform is required");
    }

    // check if platform is android or ios
    if (!["android", "ios", "web"].includes(platform)) {
      throw new BadRequestError("Invalid platform");
    }

    if (body.provider === Provider.APPLE) {
      const authService = new AuthService(token);
      return await authService.signin(Provider.APPLE, body, res);
    }

    const ANDROID_CLIENT_ID = process.env.WEB_GOOGLE_CLIENT_ID;
    const WEB_CLIENT_ID = process.env.WEB_GOOGLE_CLIENT_ID;
    const IOS_CLIENT_ID = process.env.IOS_GOOGLE_CLIENT_ID;

    const clientId = {
      android: ANDROID_CLIENT_ID,
      ios: IOS_CLIENT_ID,
      web: WEB_CLIENT_ID,
    }[platform];

    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestError("Invalid Google token");

    const user = await User.findOneBy({
      email: payload.email,
    });

    if (!user) {
      const newUser = new User();

      if (!payload.email) throw new BadRequestError("Email is required");

      newUser.email = payload.email || "";
      newUser.names = payload.name || "";
      newUser.profilePictureUrl = payload.picture || "";
      newUser.username = body.username || "";
      newUser.provider = "google";
      newUser.authId = payload.sub;

      if (body.principal) newUser.principal = body.principal;

      /**
       *
       * If the user does not have username, means their info data
       * Is accepted but not ready to be saved until user sends username as well.
       *
       */
      if (!newUser.username) {
        return res.status(202).json({
          message: "User info has been accepted for processing.",
        });
      }
      await newUser.save();

      const userData = {
        id: newUser.id,
        email: newUser.email,
        names: newUser.names,
        phoneNumber: newUser.phoneNumber,
        emailVerified: newUser.emailVerified,
        provider: newUser.provider,
        profilePictureUrl: newUser.profilePictureUrl,
        username: newUser.username,
        points: 0,
        sub: newUser.authId,
      };

      // generate access and refresh tokens
      const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "3d",
      });

      const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      return { ...userData, access_token, refresh_token };
    }

    if (!user.authId) {
      user.authId = payload.sub;
      await user.save();
    }

    if (body.principal) {
      user.principal = body.principal;
      await user.save();
    }

    const userData = {
      id: user.id,
      email: user.email,
      names: user.names,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      provider: user.provider,
      profilePictureUrl: user.profilePictureUrl,
      username: user.username,
      sub: user.authId,
    };

    // generate access and refresh tokens
    const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "3d",
    });

    const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const pointsService = new PointsServices();
    pointsService.registerUserOnCanister({ sub: payload.sub });

    return { ...userData, access_token, refresh_token };
  }

  @Get("/current-user")
  async me(@CurrentUser() user: User) {
    return await User.findOneByOrFail({ id: user.id });
  }
}
