import { Friendship } from "../entity/Friendship";
import { FriendSignal } from "../entity/FriendSignal";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";

export class UserService {
  static async deleteMyAccount(user: AppUser) {
    /**
     * 
     * Delete all friend signals where the user is the initiator.
     *
     */
    await FriendSignal.delete({ friendship: { user: { id: user.id } } });
    await Signal.delete({ user: { id: user.id } });

    /**
     * 
     * Delete all friendships where the user is the initiator or the friend.
     * 
     */
    await Friendship.delete({ user: { id: user.id } });
    await Friendship.delete({ friend: { id: user.id } });

    /**
     *
     * Eventually, delete the user.
     *
     */
    return await User.delete({ id: user.id });
  }
}
