import { Body, CurrentUser, Get, JsonController, Post } from "routing-controllers";
import { VerifyInvitationCode } from "../dto/invitation/invite.code.dto";
import { InvitationService } from "../service/invitation.service";
import { AppUser } from "../types/auth";

@JsonController("/api/invitations")
export class InvitationController {
  @Get("")
  async getInvitationCode(@CurrentUser() _user: AppUser) {
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
