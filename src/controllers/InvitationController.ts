import { Body, CurrentUser, Get, JsonController, Post } from "routing-controllers";
import { VerifyInvitationCode } from "../dto/invitation";
import { InvitationService } from "../service/InvitationService";
import { AppUser } from "../types/Auth";

@JsonController("/api/invitations")
export class InvitationController {
  @Get("")
  async getInvitationCode(@CurrentUser() user: AppUser) {
    const invitationCode = InvitationService.generate();
    return {
      invitationCode,
    };
  }

  @Post("/verify")
  async verifyInvitationCode(
    @Body({ validate: true, required: true }) body: VerifyInvitationCode
  ) {
    return {
      isValid: InvitationService.verify(body.invitationCode),
    };
  }
}
