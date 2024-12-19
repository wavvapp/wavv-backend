import { Friendship } from "../entity/Friendship";
import { FriendSignal } from "../entity/FriendSignal";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";

type AddFriendsToMySignalParams = {
  friendIds: string[];
  user: AppUser;
};

class SignalService {
  async getMySignalWithAssignedFriend(user: AppUser) {
    const signal = await Signal.findOne({
      where: { user: { id: user.id } },
      relations: ["friendSignal.friendship.friend"],
    });

    if (signal) {
      const structuredSignalData = {
        ...signal,
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

  async initiateSignalIfNotExist({ user }: { user: AppUser }) {
    const mySignal = await this.getMySignalWithAssignedFriend(user);

    if (!mySignal) {
      const currentUser = await User.findOneByOrFail({ id: user.id });

      const newSignal = new Signal();
      newSignal.user = currentUser;
      newSignal.when = "now";
      newSignal.statusMessage = "available";
      await newSignal.save();

      return { ...newSignal, friends: [] };
    }

    return mySignal;
  }

  async activateMySignal({ signalId }: { signalId: string }) {
    // TODO: This happenes once a day

    // const pointsService = new PointsServices();
    //   pointsService.increaseUserPoints({
    //     sub: user.sub,
    //     points: friends.length * ACTIVITY_FRIENDS_POINTS,
    //   });

    // TODO: Only if this signal has ended
    const now = new Date();
    return await Signal.update({ id: signalId }, { endAt: now });
  }

  async disactivateMySignal({ signalId }: { signalId: string }) {
    // TODO: decrease the end date
    const now = new Date();
    return await Signal.update({ id: signalId }, { endAt: now });
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
}

export default SignalService;
