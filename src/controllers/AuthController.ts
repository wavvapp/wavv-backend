import bcrypt from "bcrypt";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  Body,
  CurrentUser,
  HttpError,
  JsonController,
  Patch,
  Post,
} from "routing-controllers";
import { User } from "../entity/User";
import type { AppUser } from "../types/Auth";

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
}

class GoogleSigninBody {
  @IsNotEmpty()
  @IsString()
  token: string;
  platform: string;
}

@JsonController("/api/auth")
export class AuthController {
  @Post("/login")
  async login(@Body({ required: false, validate: true }) body: LoginBody) {
    const { email, password } = body;

    const user = await User.findOneBy({
      email,
    });

    if (!user) throw new BadRequestError("User with that email does not exist");

    if (!user.isActive)
      throw new BadRequestError(
        "Your account is not active. Please contact support"
      );

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new BadRequestError("Incorrect password");

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
      expiresIn: "15m",
    });

    const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return { ...userData, access_token, refresh_token };
  }
  @Post("/register")
  async register(
    @Body({ required: false, validate: true }) body: RegisterBody
  ) {
    const { email, password, names } = body;

    const userExists = await User.findOneBy({
      email,
    });

    if (userExists)
      throw new BadRequestError("User with that email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.save({
      email,
      password: hashedPassword,
      names,
      provider: "email",
    });

    const userData = {
      id: newUser.id,
      email: newUser.email,
      names: newUser.names,
      phoneNumber: newUser.phoneNumber,
      emailVerified: newUser.emailVerified,
      profilePictureUrl: newUser.profilePictureUrl,
    };

    // generate access and refresh tokens
    const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return { ...userData, access_token, refresh_token };
  }
  @Post("/forgot-password")
  async forgotPassword(
    @Body({ required: false, validate: true }) body: ForgotPasswordBody
  ) {
    // forgot password logic
    const { email } = body;

    // check if user exists
    const user = await User.findOneBy({
      email,
    });

    if (!user) throw new BadRequestError("User with that email does not exist");

    // generate reset password token
    const resetPasswordToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // send email with reset password link
    // TODO: send email with reset password link

    // update user with reset password token and expiry date
    await User.update(user.id, {
      resetPasswordToken,
    });

    return {
      message: "Password reset link sent to your email",
    };
  }
  @Post("/reset-password")
  async resetPassword(
    @Body({ required: false, validate: true }) body: ResetPasswordBody
  ) {
    const { password, token } = body;

    console.log(password, token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      const { email } = decoded as { email: string };

      console.log(email);

      // check if user exists
      const user = await User.findOneBy({
        email,
        resetPasswordToken: token,
      });

      if (!user)
        throw new BadRequestError("Invalid or expired token. Please try again");

      // update user with new password
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: "",
      });

      return {
        message: "Password reset successful",
      };
    } catch (error: any) {
      if (error)
        throw new BadRequestError(
          error["message"] || "Invalid or expired token"
        );
    }
  }
  @Post("/change-password")
  async changePassword(
    @Body({ required: false, validate: true }) body: ChangePasswordBody,
    @CurrentUser({ required: true }) appUser: AppUser
  ) {
    // change password logic
    const { oldPassword, newPassword } = body;

    if (oldPassword === newPassword)
      throw new BadRequestError(
        "New password must be different from old password"
      );

    const user = await User.findOneBy({
      id: appUser.id,
    });

    if (!user) throw new HttpError(401, "Unauthorized");

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);

    if (!isPasswordValid) throw new BadRequestError("Incorrect old password");

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await User.update(user.id, {
      password: hashedPassword,
    });

    return {
      message: "Password changed successfully",
    };
  }
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
        expiresIn: "15m",
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
    const { names, email, phoneNumber, location, bio, profilePictureUrl } =
      body;

    const data: Record<string, string | boolean> = {};

    if (names) data.names = names;
    if (email) data.email = email;
    if (phoneNumber) data.phoneNumber = phoneNumber;
    if (location) data.location = location;
    if (bio) data.bio = bio;
    if (profilePictureUrl) data.profilePictureUrl = profilePictureUrl;

    await User.update(appUser.id, data);

    return {
      message: "Profile updated successfully",
    };
  }

  @Post("/google-signin")
  async googleSignin(@Body() body: GoogleSigninBody) {
    const { token, platform } = body;

    if (!platform) {
      throw new BadRequestError("Platform is required");
    }

    // check if platform is android or ios
    if (platform !== "android" && platform !== "ios") {
      throw new BadRequestError("Invalid platform");
    }

    const ANDROID_CLIENT_ID = process.env.ANDROID_GOOGLE_CLIENT_ID;
    const IOS_CLIENT_ID = process.env.ANDROID_GOOGLE_CLIENT_ID;

    const clientId = platform === "android" ? ANDROID_CLIENT_ID : IOS_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestError("Invalid Google token");

    const userInfo = {
      email: payload["email"],
      name: payload["name"],
      picture: payload["picture"],
    };

    const user = await User.findOneBy({
      email: userInfo.email,
    });

    if (!user) {
      const newUser = await User.save({
        email: userInfo.email,
        names: userInfo.name,
        profilePictureUrl: userInfo.picture,
        provider: "google",
      });

      const userData = {
        id: newUser.id,
        email: newUser.email,
        names: newUser.names,
        phoneNumber: newUser.phoneNumber,
        emailVerified: newUser.emailVerified,
        provider: newUser.provider,
        profilePictureUrl: newUser.profilePictureUrl,
        isNew: true,
      };

      // generate access and refresh tokens
      const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "15m",
      });

      const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      return { ...userData, access_token, refresh_token };
    }

    // check if provider is not google
    if (user.provider !== "google")
      throw new BadRequestError(
        "User with that email already exists. Please login with email and password"
      );

    const userData = {
      id: user.id,
      email: user.email,
      names: user.names,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      provider: user.provider,
      profilePictureUrl: user.profilePictureUrl,
    };

    // generate access and refresh tokens
    const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return { ...userData, access_token, refresh_token };
  }
}
