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
  status_message: string;

  @IsNotEmpty()
  @IsString()
  when: string;
}

@JsonController("/api/my-signal")
export class SignalController {
  @Get("/")
  async getMyCurrentSignal(@CurrentUser() user: AppUser) {
    const signalService = new SignalService();
    return await signalService.getMySignalWithAssignedFriend(user);
  }

  @Post("/turn-on")
  async turnOnSignal(@CurrentUser() user: AppUser) {
    const signalService = new SignalService();
    const useHasSignal = await signalService.hasSignal(user);

    // Re-activate user signal if it was disactivated before.
    if (useHasSignal) {
      await signalService.activateMySignal(user);
    }

    // initiate new signal
    return await signalService.initiateSignalIfNotExist({
      ...user,
      timezone: "",
    });
  }

  @Post("/turn-off")
  async turnOffSignal(@CurrentUser() user: AppUser) {
    const signalService = new SignalService();
    const mySignal = await signalService.getMyCurrentSignal(user);
    return await signalService.disactivateMySignal({
      signalId: mySignal?.id,
    });
  }

  @Put("/")
  async updateCurrentSignal(
    @CurrentUser() user: AppUser,
    @Body() body: UpdateSignalBody
  ) {
    const { friends } = body;
    const signal = await Signal.findOneByOrFail({ user: { id: user.id } });
    const signalService = new SignalService();

    // Reset friends assigned on my signal
    await FriendSignal.delete({ signal: { id: signal.id } });

    signal.status_message = body.status_message;
    signal.when = body.when.toLowerCase();

    await signal.save();

    await signalService.addFriendsToMySignal({ friendIds: friends, user });

    // fetch friend signals
    return await signalService.getMySignalWithAssignedFriend(user);
  }
}
