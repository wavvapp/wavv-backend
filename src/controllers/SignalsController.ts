import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import {
  Body,
  CurrentUser,
  Get,
  HttpError,
  JsonController,
  Post,
  Put,
} from "routing-controllers";
import { ACTIVITY_FRIENDS_POINTS } from "../constants/points";
import { Friendship } from "../entity/Friendship";
import { FriendSignal } from "../entity/FriendSignal";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import PointsServices from "../service/PointsServices";
import { AppUser } from "../types/Auth";

class UpdateSignalBody {
  @MaxLength(100, {
    each: true,
  })
  friends: string[];
  @IsNotEmpty()
  @IsString()
  status_message: string;
  @IsNotEmpty()
  @IsString()
  when: string;
}

@JsonController("/api/my-signal")
export class SignalController {
  @Get("/")
  async getMyCurrentSignal(@CurrentUser() user: AppUser) {
    try {
      const currentUser = await User.findOneByOrFail({
        id: user.id,
      });

      const signal = await Signal.findOne({
        where: { user: { id: user.id } },
        relations: ["friendSignal.friendship.user"],
      });

      if (!signal) {
        const newSignal = Signal.create({
          user: currentUser,
          status: "inactive",
          when: "now",
          status_message: "available",
        });
        await newSignal.save();

        return { ...newSignal, friends: [] };
      }

      return {
        ...signal,
        friends: signal.friendSignal.map((friendSignal) => {
          return {
            id: friendSignal.id,
            friendId: friendSignal.friendship.id,
            username: friendSignal.friendship.user.username,
            names: friendSignal.friendship.user?.names,
            profilePictureUrl: friendSignal.friendship.user?.profilePictureUrl,
          };
        }),
      };
    } catch (error) {
      console.log(error);
    }
  }

  // turn on the current signal, where we find or create a signal for the user
  @Post("/turn-on")
  async turnOnSignal(@CurrentUser() user: User): Promise<Signal> {
    let signal;
    try {
      signal = await Signal.findOneBy({ user: { id: user.id } });
    } catch (error) {
      throw new HttpError(500, "Error finding signal");
    }

    if (!signal) {
      throw new HttpError(404, "Signal not found");
    }

    signal.status = "active";

    try {
      await signal.save();
    } catch (error) {
      throw new HttpError(500, "Error saving signal");
    }

    return signal;
  }

  // turn off the current signal
  @Post("/turn-off")
  async turnOffSignal(@CurrentUser() user: User): Promise<Signal> {
    let signal;
    try {
      signal = await Signal.findOneBy({ user: { id: user.id } });
    } catch (error) {
      throw new HttpError(500, "Error finding signal");
    }

    if (!signal) {
      throw new HttpError(404, "Signal not found");
    }

    signal.status = "inactive";
    // delete all friend signals
    await FriendSignal.delete({ signal: { id: signal.id } });

    try {
      await signal.save();
    } catch (error) {
      throw new HttpError(500, "Error saving signal");
    }

    return signal;
  }

  // turn off the current signal
  @Put("/")
  async updateCurrentSignal(
    @CurrentUser() user: AppUser,
    @Body() body: UpdateSignalBody
  ) {
    const { friends } = body;
    let signal;
    try {
      signal = await Signal.findOneBy({ user: { id: user.id } });
    } catch (error) {
      throw new HttpError(500, "Error finding signal");
    }

    if (!signal) {
      throw new HttpError(404, "Signal not found");
    }

    // delete all friend on the signals
    await FriendSignal.delete({ signal: { id: signal.id } });

    // add new friend to the signals
    for (const friendId of friends) {
      const friendship = await Friendship.findOneOrFail({
        where: [
          { user: { id: user.id }, friend: { id: friendId } },
        ],
      });
      const friendSignal = FriendSignal.create({
        friendship: { id: friendship.id },
        signal: { id: signal.id },
      });
      await friendSignal.save();
    }

    signal.status_message = body.status_message;
    signal.when = body.when;

    await signal.save();

    // fetch friend signals
    const newSignal = await Signal.findOne({
      where: { user: { id: user.id } },
      relations: ["friendSignal.friendship.user"],
    });


    const pointsService = new PointsServices();
    pointsService.insreaseUserPoints(user.id, friends.length * ACTIVITY_FRIENDS_POINTS);

    return {
      ...newSignal,
      friends: newSignal?.friendSignal.map((signal) => {
        return {
          friendId: signal.friendship.user.id,
          username: signal.friendship.user.username,
          names: signal.friendship.user.names,
          profilePictureUrl: signal.friendship.user.profilePictureUrl,
        };
      }),
    };
  }
}
