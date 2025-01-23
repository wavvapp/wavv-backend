import { Body, Get, JsonController, Post } from "routing-controllers";
import { InvitationService } from "../service/InvitationService";

@JsonController("/api/invitations")
export class InvitationController {
  @Get("")
  async getInvitationCode() {
    const invitationCode = InvitationService.generate();
    return {
      invitationCode,
    };
  }

  @Post("")
  async verifyInvitationCode(
    @Body({ validate: true, required: true }) body: { invatationCode: number }
  ) {
    return {
      isValid: InvitationService.verify(body.invatationCode),
    };
  }
}
