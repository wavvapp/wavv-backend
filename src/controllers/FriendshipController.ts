import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import {
  Body,
  CurrentUser,
  Get,
  HttpError,
  JsonController,
  Patch,
  Post,
} from "routing-controllers";
import { BaseEntity } from "typeorm";
import { UpdateNotificationSettingsDto } from "../dto/friendship/UpdateNotificationSettingsDto";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { FriendshipService } from "../service/FriendShipService";
import { NotificationService } from "../service/NotificationService";
import { AppUser } from "../types/Auth";

class CreateFriendshipDto {
  @IsNotEmpty()
  friendId: string;

  @IsBoolean()
  @IsOptional()
  hasNotificationEnabled?: boolean;
}
type GetAllFriendshipsResponse = Omit<User, keyof BaseEntity> & {
  hasNotificationEnabled: boolean;
};

@JsonController("/api/friends")
export class FriendshipController {
  @Get("/")
  async getAllFriendships(
    @CurrentUser() user: User
  ): Promise<GetAllFriendshipsResponse[]> {
    const friendShips = await Friendship.find({
      select: {
        friend: {
          id: true,
          names: true,
        },
      },
      where: { user: { id: user.id } },
      relations: ["friend"],
      order: {
        createdAt: "DESC",
      },
    });

    const friends = friendShips.map((friendShip) => ({
      ...friendShip.friend,
      hasNotificationEnabled: friendShip.hasNotificationEnabled,
    }));

    return friends;
  }

  @Post("/")
  async createFriendship(
    @Body() friendshipRequest: CreateFriendshipDto,
    @CurrentUser() currentUser: AppUser
  ): Promise<Friendship> {
    const existingFriendshipCount = await Friendship.countBy({
      user: { id: currentUser.id },
      friend: { id: friendshipRequest.friendId },
    });

    if (existingFriendshipCount > 0) {
      throw new HttpError(400, "Friendship already exists");
    }

    const friendToAdd = await User.findOneByOrFail({
      id: friendshipRequest.friendId,
    });
    const currentUserEntity = await User.findOneByOrFail({
      id: currentUser.id,
    });

    // Create friendship from current user to friend
    const currentUserFriendship = new Friendship();
    currentUserFriendship.user = currentUserEntity;
    currentUserFriendship.friend = friendToAdd;
    currentUserFriendship.status = "approved";

    if (friendshipRequest.hasNotificationEnabled) {
      currentUserFriendship.hasNotificationEnabled = true;
    }

    // Create friendship from friend to current user
    const friendFriendship = new Friendship();
    friendFriendship.user = friendToAdd;
    friendFriendship.friend = currentUserEntity;
    friendFriendship.status = "pending";

    const notificationService = new NotificationService();
    const { body, title } =
      FriendshipService.buildAddFriendNotificationMessage(currentUserEntity);
    await notificationService.sendPushNotificationsTo({
      token: friendToAdd.notificationToken,
      body,
      title,
    });

    const inverseExistingFriendshipCount = await Friendship.countBy({
      user: { id: currentUser.id },
      friend: { id: friendshipRequest.friendId },
    });

    if (inverseExistingFriendshipCount === 0) {
      await friendFriendship.save();
    }

    return await currentUserFriendship.save();
  }

  @Post("/unfriend")
  async unfriendFriendship(
    @CurrentUser() currentUser: AppUser,
    @Body({ validate: true, required: true }) body: { friendId: string }
  ) {
    await FriendshipService.unfriend({ friendId: body.friendId, currentUser });

    return { message: "Friendship deleted successfully" };
  }

  @Patch("/notification/settings")
  async updateNotificationSettings(
    @CurrentUser() currentUser: AppUser,
    @Body({ validate: true, required: true })
    body: UpdateNotificationSettingsDto
  ) {
    await FriendshipService.disableOrEnableNotification({
      currentUser,
      hasNotificationEnabled: body.enableNotification,
      friendId: body.friendId,
    });

    return {
      success: true,
      message: `Notifications have been ${
        body.enableNotification ? "enabled" : "disabled"
      }.`,
    };
  }
}
