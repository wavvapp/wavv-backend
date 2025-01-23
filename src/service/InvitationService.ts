import { VERIFICATION_CODE } from "../constants/verification_code";

export class InvitationService {
  static verify(code: number) {
    return code === VERIFICATION_CODE;
  }
  static generate() {
    return VERIFICATION_CODE;
  }
}
