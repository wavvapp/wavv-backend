import { differenceInDays } from "date-fns";
import { SIGNAL_ACTIVATION_POINTS } from "../constants/points";
import { Friendship } from "../entity/Friendship";
import { FriendSignal } from "../entity/FriendSignal";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";
import { getNext3AM } from "../utils/getNext3AM";
import PointsServices from "./PointsServices";

type AddFriendsToMySignalParams = {
  friendIds: string[];
  user: AppUser;
};

class SignalService {
  protected pointsService: PointsServices;

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
        hasEnded: signal.hasEnded,
        friends: signal.friendSignal.map((friendSignal) => {
          return {
            friendId: friendSignal.friendship.friend.id,
            username: friendSignal.friendship.friend.username,
            names: friendSignal.friendship.friend.names,
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

  async initiateSignalIfNotExist({ user }: { user: AppUser }) {
    const mySignal = await this.getMySignalWithAssignedFriend(user);

    if (!mySignal) {
      const currentUser = await User.findOneByOrFail({ id: user.id });

      const newSignal = new Signal();
      newSignal.user = currentUser;
      newSignal.when = "now";
      newSignal.status_message = "available";
      await newSignal.save();

      return { ...newSignal, friends: [] };
    }

    return mySignal;
  }

  async activateMySignal(user: AppUser) {
    const mySignal = await Signal.findOneOrFail({
      where: { user: { id: user.id } },
    });

    if (mySignal.hasEnded) {
      const isNextDay = differenceInDays(mySignal.updatedAt, new Date());

      /**
       *
       * You only the SIGNAL_ACTIVATION_POINTS per day
       *
       * */

      if (isNextDay) {
        await this.pointsService.increaseUserPoints({
          sub: user.sub,
          points: SIGNAL_ACTIVATION_POINTS,
        });
      }

      mySignal.endsAt = getNext3AM();
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

    for (const friendId of friendIds) {
      const friendship = await Friendship.findOneOrFail({
        where: [{ user: { id: user.id }, friend: { id: friendId } }],
      });

      const friendSignal = FriendSignal.create({
        friendship: { id: friendship.id },
        signal: { id: signal.id },
      });

      await friendSignal.save();
    }
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

    if(!friendSignal) {
      return;
    }

    await friendSignal.remove();
  }
}

export default SignalService;
