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
import {
  AuthSigninBody,
  RefreshTokenBody,
  UpdateProfileBody,
} from "../dto/auth/login";
import { User } from "../entity/User";
import AuthService from "../service/AuthService";
import { InvitationService } from "../service/InvitationService";
import PointsServices from "../service/PointsServices";
import SignalService from "../service/SignalService";
import { AppUser, Provider } from "../types/Auth";

@JsonController("/api/auth")
export class AuthController {
  @Post("/refresh-token")
  async refreshToken(
    @Body({ required: false, validate: true }) body: RefreshTokenBody
  ) {
    // refresh token logic
    const { refresh_token: token } = body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await User.findOneBy({
      id: decoded.id,
    });

    if (!user)
      throw new BadRequestError("Invalid or expired token. Please login again");

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

      newUser.email = payload.email;
      if (body.names) {
        newUser.names = body.names;
      }
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

      newUser.email = payload.email;
      if (body.names) {
        newUser.names = body.names;
      }
      newUser.profilePictureUrl = payload.picture || "";
      newUser.username = body.username || "";
      newUser.provider = "google";
      newUser.authId = payload.sub;

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

      const signalService = new SignalService();
      await signalService.initiateSignalIfNotExist({
        ...userData,
        timezone: "",
      });

      return {
        ...userData,
        access_token,
        refresh_token,
        inviteCode: InvitationService.generate(),
      };
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

    return {
      ...userData,
      access_token,
      refresh_token,
      inviteCode: InvitationService.generate(),
    };
  }

  /*
   *
   * @deprecated
   * Please use /users instead
   */
  @Patch("/update-profile")
  async updateProfile(
    @Body({ required: false, validate: true }) body: UpdateProfileBody,
    @CurrentUser({ required: true }) appUser: AppUser
  ) {
    /**
     *
     * Update profile logic
     *
     */
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
    }

    await User.update(appUser.id, data);

    return {
      message: "Profile updated successfully.",
    };
  }

  @Get("/current-user")
  async me(@CurrentUser() user: User) {
    return await User.findOneByOrFail({ id: user.id });
  }
}
