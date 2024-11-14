import { IsNotEmpty } from "class-validator";
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
import { FriendSignal } from "../entity/FriendSignal";
import { Friendship } from "../entity/Friendship";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";

class CreateFriendSignalDto {
  @IsNotEmpty()
  friendshipId: string;
  @IsNotEmpty()
  signalId: string;
}

@JsonController("/api/friend-signals")
@Authorized()
export class FriendSignalController {
  @Get()
  async getAllFriendSignals(@CurrentUser() user: User): Promise<Signal[]> {
    const signal = await Signal.find({
      relations: ["friendSignal.friendship.friend"],
      where: {
        friendSignal: {
          friendship: {
            user: {
              id: user.id,
            },
          },
        },
      },
    });

    return signal;
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

  @Post()
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
