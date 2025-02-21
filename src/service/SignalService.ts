import { differenceInDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { SIGNAL_ACTIVATION_POINTS } from "../constants/points";
import { Friendship } from "../entity/Friendship";
import { FriendSignal } from "../entity/FriendSignal";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import type { AppUser } from "../types/Auth";
import { getNext3AM } from "../utils/getNext3AM";
import { NotificationService } from "./NotificationService";
import PointsServices from "./PointsServices";

type AddFriendsToMySignalParams = {
  friendIds: string[];
  user: AppUser;
};

const DEFAULT_STATUS_MESSAGE = "Available";

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
      const structuredSignalData = {
        ...signal,
        hasEnded: signal.hasEnded(user.timezone),
        friends: signal.friendSignal.map((friendSignal) => {
          return {
            friendId: friendSignal.friendship.friend.id,
            username: friendSignal.friendship.friend.username,
            names: friendSignal.friendship.friend.names,
            hasNotificationEnabled: friendSignal.friendship.hasNotificationEnabled,
            profilePictureUrl:
              friendSignal.friendship.friend?.profilePictureUrl,
          };
        }),
      };

      structuredSignalData.friendSignal = [];

      return structuredSignalData;
    }
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

  async activateMySignal(user: AppUser) {
    const mySignal = await Signal.findOneOrFail({
      select: ["user", "activatedAt", "endsAt", "id"],
      where: { user: { id: user.id } },
    });

    const userInfo = await User.findOneByOrFail({ id: user.id });
    const hasEnded = mySignal.hasEnded(user.timezone);

    if (hasEnded) {
      const now = toZonedTime(new Date(), user.timezone);
      const isNextDay = differenceInDays(mySignal.activatedAt, now);

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

        mySignal.activatedAt = now;
        mySignal.status_message = DEFAULT_STATUS_MESSAGE;
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
