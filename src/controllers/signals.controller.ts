import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
  Post,
  Put,
} from "routing-controllers";
import { FriendSignal } from "../entity/friend.signal.entity";
import { Signal } from "../entity/signal.entity";
import SignalService from "../service/signal.service";
import { AppUser } from "../types/auth";

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

@Authorized()
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
    const userHasSignal = await signalService.hasSignal(user);

    // Re-activate user signal if it was disactivated before.
    if (userHasSignal) {
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
    const { friends, status_message, when } = body;
    const signalService = new SignalService();
    const signal = await signalService.initiateSignalIfNotExist(user)

    
    // Reset friends assigned on my signal
    await FriendSignal.delete({ signal: { id: signal.id } });

    await Signal.update(signal.id, {
      status_message: status_message,
      when: when.toLowerCase()
    });

    await signalService.addFriendsToMySignal({ friendIds: friends, user });

    await signalService.activateMySignal(user)

    // fetch friend signals
    return await signalService.getMySignalWithAssignedFriend(user);
  }
}
