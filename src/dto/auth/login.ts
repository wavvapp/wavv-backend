import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Provider } from "../../types/Auth";
import { Preferance } from "../../types/User";

export class LoginBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RegisterBody {
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

export class ForgotPasswordBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordBody {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ChangePasswordBody {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class RefreshTokenBody {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class UpdateProfileBody {
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

  @IsOptional()
  preferances?: Preferance;

  @IsOptional()
  @IsString()
  notificationToken?: string
}

export class AuthSigninBody {
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
  //TODO: This should be required after then next release
  @IsOptional()
  names?: string;

  @IsEmail()
  @IsOptional()
  email: string;
}
