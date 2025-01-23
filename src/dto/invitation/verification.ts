import { IsNumber } from "class-validator";

export class VerifyInvitationCode {
    @IsNumber()
    invitationCode: number
}
