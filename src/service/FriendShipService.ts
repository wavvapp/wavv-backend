import { HttpError } from "routing-controllers";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";
import SignalService from "./SignalService";

type FriendshipOperationsParam = {
  friendId: string;
  currentUser: AppUser;
};
export class FriendshipService {
  static async unfriend({ friendId, currentUser }: FriendshipOperationsParam) {

    const friendship = await Friendship.findOneOrFail({
      where: [{ user: { id: currentUser.id }, friend: { id: friendId } }],
    });

    await SignalService.removeFriendsIfExistFromMySignal({ friendship, user: currentUser  });
    
    return await Friendship.delete({ id: friendship.id });
  }

  static async createFriendship({ friendId, currentUser }: FriendshipOperationsParam) {
    
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
}
