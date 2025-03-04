import { IsNotEmpty } from "class-validator";
import { toZonedTime } from "date-fns-tz";
import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  HttpError,
  JsonController,
  Param,
  Post,
} from "routing-controllers";
import { MoreThan } from "typeorm";
import { FriendSignal } from "../entity/FriendSignal";
import { Friendship } from "../entity/Friendship";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";

class CreateFriendSignalDto {
  @IsNotEmpty()
  friendshipId: string;
  @IsNotEmpty()
  signalId: string;
}

type GetAllFriendSignals = {
  signal: Signal;
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  names: string;
  hasNotificationEnabled: boolean;
};

@JsonController("/api/friend-signals")
@Authorized()
export class FriendSignalController {
  @Get("/")
  async getAllFriendSignals(
    @CurrentUser() user: AppUser
  ): Promise<GetAllFriendSignals[]> {
    const now = toZonedTime(new Date(), user.timezone);
    const friendShips = await Friendship.find({
      relations: ["user", "friendSignal.signal"],
      where: {
        friendSignal: {
          friendship: {
            friend: {
              id: user.id,
            },
          },
          signal: {
            endsAt: MoreThan(now),
          },
        },
      },
    });

    const friendSignals = friendShips.map((friendShip) => {
      /**
       *
       * We expect that user should have one signal not two, for now
       *
       */
      const friendSignal = friendShip.friendSignal[0]?.signal ?? {};
      const user = {
        id: friendShip.user.id,
        username: friendShip.user.username,
        email: friendShip.user.email,
        profilePictureUrl: friendShip.user.profilePictureUrl,
        names: friendShip.user.names,
        hasNotificationEnabled: friendShip.hasNotificationEnabled,
      };
      return { ...user, signal: friendSignal };
    });

    return friendSignals;
  }

  @Get("/friendship/:friendshipId")
  async getFriendSignalsByFriendship(
    @Param("friendshipId") friendshipId: string,
    @CurrentUser() user: User
  ): Promise<FriendSignal[]> {
    const friendship = await Friendship.findOne({
      where: { id: friendshipId },
      relations: ["user"],
    });

    if (!friendship) {
      throw new HttpError(404, "Friendship not found");
    }

    if (friendship.user.id !== user.id && friendship.friend.id !== user.id) {
      throw new HttpError(403, "Not authorized to view these signals");
    }

    return await FriendSignal.find({
      where: { friendship: { id: friendshipId } },
      relations: ["signal", "friendship"],
    });
  }

  @Get("/:id")
  async getFriendSignal(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<FriendSignal> {
    const friendSignal = await FriendSignal.findOne({
      where: { id },
      relations: ["friendship", "friendship.user", "signal"],
    });

    if (!friendSignal) {
      throw new HttpError(404, "Friend signal not found");
    }

    if (
      friendSignal.friendship.user.id !== user.id &&
      friendSignal.friendship.friend.id !== user.id
    ) {
      throw new HttpError(403, "Not authorized to view this signal");
    }

    return friendSignal;
  }

  @Post("/")
  async createFriendSignal(
    @Body() friendSignalData: CreateFriendSignalDto,
    @CurrentUser() user: User
  ): Promise<FriendSignal> {
    // Check if friendship exists and is accepted
    const friendship = await Friendship.findOne({
      where: { id: friendSignalData.friendshipId },
      relations: ["user"],
    });

    if (!friendship) {
      throw new HttpError(404, "Friendship not found");
    }

    if (friendship.status !== "accepted") {
      throw new HttpError(400, "Friendship must be accepted to share signals");
    }

    if (friendship.user.id !== user.id) {
      throw new HttpError(403, "Only the friendship owner can share signals");
    }

    const signal = await Signal.findOne({
      where: {
        id: friendSignalData.signalId,
        user: { id: user.id },
      },
    });

    if (!signal) {
      throw new HttpError(404, "Signal not found or does not belong to you");
    }

    const existingShare = await FriendSignal.findOne({
      where: {
        friendship: { id: friendSignalData.friendshipId },
        signal: { id: friendSignalData.signalId },
      },
    });

    if (existingShare) {
      throw new HttpError(400, "Signal is already shared with this friend");
    }

    const friendSignal = new FriendSignal();
    friendSignal.friendship = friendship;
    friendSignal.signal = signal;

    return await FriendSignal.save(friendSignal);
  }

  @Delete("/:id")
  async deleteFriendSignal(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<void> {
    const friendSignal = await FriendSignal.findOne({
      where: { id },
      relations: ["friendship", "friendship.user", "signal"],
    });

    if (!friendSignal) {
      throw new HttpError(404, "Friend signal not found");
    }

    if (
      friendSignal.friendship.user.id !== user.id &&
      friendSignal.friendship.friend.id !== user.id
    ) {
      throw new HttpError(403, "Not authorized to delete this signal share");
    }

    await FriendSignal.remove(friendSignal);
  }
}
