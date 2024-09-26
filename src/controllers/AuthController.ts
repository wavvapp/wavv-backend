import { JsonController, Post } from "routing-controllers";
import AuthService from "../services/AuthService";

@JsonController("/api/auth")
export class AuthController {
  @Post("/login")
  login() {
    return new AuthService().login();
  }
  @Post("/register")
  register() {
    // register logic
  }
  @Post("/logout")
  logout() {
    // logout logic
  }
  @Post("/forgot-password")
  forgotPassword() {
    // forgot password logic
  }
  @Post("/reset-password")
  resetPassword() {
    // reset password logic
  }
  @Post("/change-password")
  changePassword() {
    // change password logic
  }
  @Post("/refresh-token")
  refreshToken() {
    // refresh token logic
  }
  @Post("/verify-email")
  verifyEmail() {
    // verify email logic
  }
  @Post("/resend-verification-email")
  resendVerificationEmail() {
    // resend verification email logic
  }
}
