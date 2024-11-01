import {
  Body,
  CurrentUser,
  Get,
  HttpError,
  JsonController,
  Post,
  Put,
} from "routing-controllers";
import { User } from "../entity/User";
import { Signal } from "../entity/Signal";
import { FriendSignal } from "../entity/FriendSignal";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

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
  async getMyCurrentSignal(@CurrentUser() user: User) {
    const signal = await Signal.findOne({
      where: { user: { id: user.id } },
      relations: ["friends.friendship.user"],
    });
    if (!signal) {
      const newSignal = Signal.create({
        user: { id: user.id },
        status: "inactive",
        when: "now",
        status_message: "available",
      });
      await newSignal.save();

      return { ...newSignal, friends: [] };
    }
    return {
      ...signal,
      friends: signal.friends.map((friendSignal) => {
        return {
          id: friendSignal.id,
          friendId: friendSignal.friendship.id,
          // @ts-ignore
          username: friendSignal.friendship.user?.["username"] || "",
          names: friendSignal.friendship.user?.names || "",
          profilePictureUrl:
            friendSignal.friendship.user?.profilePictureUrl || "",
        };
      }),
    };
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
    @CurrentUser() user: User,
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

    // delete all friend signals
    await FriendSignal.delete({ signal: { id: signal.id } });

    // add new friend signals
    for (const friendId of friends) {
      const friendSignal = FriendSignal.create({
        friendship: { id: friendId },
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
      relations: ["friends.friendship.user"],
    });

    return {
      ...newSignal,
      friends: newSignal?.friends.map((friendSignal) => {
        return {
          id: friendSignal.id,
          friendId: friendSignal.friendship.id,
          // @ts-ignore
          username: friendSignal.friendship.user?.["username"] || "",
          names: friendSignal.friendship.user?.names || "",
          profilePictureUrl:
            friendSignal.friendship.user?.profilePictureUrl || "",
        };
      }),
    };
  }
}
