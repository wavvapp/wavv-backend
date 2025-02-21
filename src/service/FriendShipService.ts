import { IsUUID } from "class-validator";
import { HttpError } from "routing-controllers";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";
import SignalService from "./SignalService";

const NOTIFICATION_TITLE_FOR_NEW_FRIEND = "🎉 You have a new friend!";

class FriendshipOperationsParam {
  @IsUUID("4")
  friendId: string;

  currentUser: AppUser;
}

type DisableOrEnableNotificationParms = {
  currentUser: AppUser;
  friendId: string;
  hasNotificationEnabled: boolean;
};


export class FriendshipService {
  static async unfriend({ friendId, currentUser }: FriendshipOperationsParam) {
    const friendship = await Friendship.findOneOrFail({
      where: [{ user: { id: currentUser.id }, friend: { id: friendId } }],
    });

    await SignalService.removeFriendsIfExistFromMySignal({
      friendship,
      user: currentUser,
    });

    return await Friendship.delete({ id: friendship.id });
  }

  static async createFriendship({
    friendId,
    currentUser,
  }: FriendshipOperationsParam) {
    const user = await User.findOneByOrFail({ id: currentUser.id });

    const existingFriendship = await this.checkIfWeAreFriends({
      friendId,
      currentUser,
    });

    if (existingFriendship) {
      throw new HttpError(400, "Friendship already exists");
    }

    const friend = await User.findOneByOrFail({ id: friendId });

    // Add new friend in my friendship
    const myFriendShip = new Friendship();
    myFriendShip.user = user;
    myFriendShip.friend = friend;
    myFriendShip.status = "pending";

    // Add my current profile in their friendship
    const theirFriendship = new Friendship();
    theirFriendship.user = friend;
    theirFriendship.friend = user;
    theirFriendship.status = "pending";

    await theirFriendship.save();

    return await Friendship.save(myFriendShip);
  }

  static async checkIfWeAreFriends({
    friendId,
    currentUser,
  }: FriendshipOperationsParam) {
    return await Friendship.findOne({
      where: [{ user: { id: currentUser.id }, friend: { id: friendId } }],
    });
  }

  static async disableOrEnableNotification({
    currentUser,
    friendId,
    hasNotificationEnabled,
  }: DisableOrEnableNotificationParms) {
    const friendShip = await Friendship.findOneByOrFail({
      user: { id: currentUser.id },
      friend: { id: friendId },
    });

    friendShip.hasNotificationEnabled = hasNotificationEnabled;

    return await friendShip.save();
  }

  static async checkIfFriendAcceptsMyNotification(
    friendId: string,
    currentUser: AppUser
  ) {

    /**
     * Checks if the friend has given consent to receive notifications from me.
     */
    const friendShip = await Friendship.findOneByOrFail({
      user: { id: friendId },
      friend: { id: currentUser.id },
    });

    return friendShip.hasNotificationEnabled;
  }

  static buildAddFriendNotificationMessage(user: User) {
    return {
      title: NOTIFICATION_TITLE_FOR_NEW_FRIEND,
      body: `${user.username}, just added you!`
    }
  }
}
