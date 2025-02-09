import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  @IsNotEmpty()
  enableNotification: boolean;

  @IsString()
  @IsNotEmpty()
  friendId: string;
}
