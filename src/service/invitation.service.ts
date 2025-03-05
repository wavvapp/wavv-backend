import { INVITE_CODE } from "../constants/invite.code";

export class InvitationService {
  static verify(code: number) {
    return code === INVITE_CODE;
  }
  static generate() {
    return INVITE_CODE;
  }
}
