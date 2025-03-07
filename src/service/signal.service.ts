import { differenceInDays, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { SIGNAL_ACTIVATION_POINTS } from "../constants/points";
import { FriendSignal } from "../entity/friend.signal.entity";
import { Friendship } from "../entity/friendship.entity";
import { Signal } from "../entity/signal.entity";
import { User } from "../entity/user.entity";
import type { AppUser } from "../types/auth";
import { getNext3AM } from "../utils/getNext3AM";
import { NotificationService } from "./notification.service";
import PointsServices from "./points.service";

type AddFriendsToMySignalParams = {
  friendIds: string[];
  user: AppUser;
};

const DEFAULT_STATUS_MESSAGE = "Let's hang";

class SignalService {
  protected pointsService: PointsServices;
  notificationService = new NotificationService();

  constructor() {
    this.pointsService = new PointsServices();
  }

  async getMySignalWithAssignedFriend(user: AppUser) {
    const signal = await Signal.findOne({
      where: { user: { id: user.id } },
      relations: ["friendSignal.friendship.friend"],
    });

    
    if (signal) {
      signal.status_message = this.buildStatusMessage(signal, user)
      
      const structuredSignalData = {
        ...signal,
        hasEnded: signal.hasEnded(user.timezone),
        friends: signal.friendSignal.map((friendSignal) => {
          return {
            friendId: friendSignal.friendship.friend.id,
            username: friendSignal.friendship.friend.username,
            names: friendSignal.friendship.friend.names,
            hasNotificationEnabled:
              friendSignal.friendship.hasNotificationEnabled,
            profilePictureUrl:
              friendSignal.friendship.friend?.profilePictureUrl,
          };
        }),
      };

      structuredSignalData.friendSignal = [];

      return structuredSignalData;
    }
  }

  isNextDay(date: Date, timezone: string) {
    const now = startOfDay(toZonedTime(new Date(), timezone));
    const activatedAt = startOfDay(date);
    const daysInDiff = differenceInDays(now, activatedAt);

    return daysInDiff > 0;
  }

  async getMyCurrentSignal(user: AppUser) {
    return await Signal.findOneOrFail({
      where: { user: { id: user.id } },
    });
  }

  async hasSignal(user: AppUser) {
    return await Signal.existsBy({
      user: {
        id: user.id,
      },
    });
  }

  async initiateSignalIfNotExist(user: AppUser) {
    const mySignal = await this.getMySignalWithAssignedFriend(user);

    if (!mySignal) {
      const currentUser = await User.findOneByOrFail({ id: user.id });

      const newSignal = new Signal();
      newSignal.user = currentUser;
      newSignal.when = "now";
      newSignal.status_message = DEFAULT_STATUS_MESSAGE;
      await newSignal.save();

      return { ...newSignal, friends: [] };
    }

    return mySignal;
  }


  buildStatusMessage (signal: Signal, user: AppUser) {
    const hasEnded = signal.hasEnded(user.timezone);
    const isNextDay = this.isNextDay(signal.activatedAt, user.timezone);

    if (hasEnded && isNextDay) return DEFAULT_STATUS_MESSAGE

    return signal.status_message
  }

  async activateMySignal(user: AppUser) {
    const mySignal = await Signal.findOneOrFail({
      select: ["user", "activatedAt", "endsAt", "id"],
      where: { user: { id: user.id } },
    });

    const userInfo = await User.findOneByOrFail({ id: user.id });
    const hasEnded = mySignal.hasEnded(user.timezone);

    if (hasEnded) {
      const isNextDay = this.isNextDay(mySignal.activatedAt, user.timezone);

      /**
       *
       * You only the SIGNAL_ACTIVATION_POINTS per day
       *
       */

      if (isNextDay) {
        await this.pointsService.increaseUserPoints({
          sub: userInfo.authId,
          points: SIGNAL_ACTIVATION_POINTS,
        });

        mySignal.status_message = this.buildStatusMessage(mySignal, user);
        mySignal.activatedAt = startOfDay(
          toZonedTime(new Date(), user.timezone)
        ); 
      }

      mySignal.endsAt = getNext3AM(user.timezone);
      await mySignal.save();
    }

    return await this.getMySignalWithAssignedFriend(user);
  }

  async disactivateMySignal({ signalId }: { signalId: string }) {
    const now = new Date();
    return await Signal.update({ id: signalId }, { endsAt: now });
  }

  async addFriendsToMySignal({ friendIds, user }: AddFriendsToMySignalParams) {
    const signal = await Signal.findOneByOrFail({ user: { id: user.id } });
    const friendsOnSignal: User[] = [];

    for await (const friendId of friendIds) {
      const friendship = await Friendship.findOneOrFail({
        where: [{ user: { id: user.id }, friend: { id: friendId } }],
      });

      const friend = await User.findOneByOrFail({ id: friendId });
      friendsOnSignal.push(friend);

      const friendSignal = FriendSignal.create({
        friendship: { id: friendship.id },
        signal: { id: signal.id },
      });

      await friendSignal.save();
    }

    await this.notificationService.sendSignalNotificationToFriends(
      friendsOnSignal,
      user,
      {
        statusMessage: signal.status_message,
        when: signal.when,
      }
    );
  }

  static async removeFriendsIfExistFromMySignal({
    friendship,
    user,
  }: {
    friendship: Friendship;
    user: AppUser;
  }) {
    const signal = await Signal.findOneBy({ user: { id: user.id } });

    if (!signal) {
      return;
    }

    const friendSignal = await FriendSignal.findOne({
      where: { friendship: { id: friendship.id }, signal: { id: signal.id } },
    });

    if (!friendSignal) {
      return;
    }

    await friendSignal.remove();
  }
}

export default SignalService;
