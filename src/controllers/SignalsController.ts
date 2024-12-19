import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Post,
  Put,
} from "routing-controllers";
import { FriendSignal } from "../entity/FriendSignal";
import { Signal } from "../entity/Signal";
import SignalService from "../service/SignalService";
import { AppUser } from "../types/Auth";

class UpdateSignalBody {
  @MaxLength(100, {
    each: true,
  })
  friends: string[];

  @IsNotEmpty()
  @IsString()
  statusMessage: string;

  @IsNotEmpty()
  @IsString()
  when: string;
}

@JsonController("/api/my-signal")
export class SignalController {
  @Get("/")
  async getMyCurrentSignal(@CurrentUser() user: AppUser) {
    const signalSerivce = new SignalService();
    return await signalSerivce.initiateSignalIfNotExist({ user });
  }


  @Post("/turn-on")
  async turnOnSignal(@CurrentUser() user: AppUser) {
    const signalSerivce = new SignalService();
    const signal = await signalSerivce.getMySignalWithAssignedFriend(user);

    // Re-activate user signal.
    if (signal) {
      await signalSerivce.activateMySignal({ signalId: signal.id });
    }

    // initiate new signal
    return await signalSerivce.initiateSignalIfNotExist({ user });
  }



  @Post("/turn-off")
  async turnOffSignal(@CurrentUser() user: AppUser) {
    const signalSerivce = new SignalService();
    const mySignal = this.getMyCurrentSignal(user);
    const signal = await signalSerivce.disactivateMySignal({
      signalId: (await mySignal).id,
    });

    return signal;
  }



  @Put("/")
  async updateCurrentSignal(
    @CurrentUser() user: AppUser,
    @Body() body: UpdateSignalBody
  ) {
    const { friends } = body;
    const signal = await Signal.findOneByOrFail({ user: { id: user.id } });
    const signalSerivce = new SignalService();

    // Reset friends assigned on my signal
    await FriendSignal.delete({ signal: { id: signal.id } });
    await signalSerivce.addFriendsToMySignal({ friendIds: friends, user });

    signal.statusMessage = body.statusMessage;
    signal.when = body.when;

    await signal.save();

    // fetch friend signals
    return await signalSerivce.getMySignalWithAssignedFriend(user);

  }
}
