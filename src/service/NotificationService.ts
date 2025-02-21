import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";
import { FriendshipService } from "./FriendShipService";
import { UserService } from "./UserService";

export class NotificationService {
  expo = new Expo();
  userService = new UserService();

  async sendSignalNotificationTo(
    friends: User[],
    currentUser: AppUser,
    signalData: {
      statusMessage: string;
      when: string;
    }
  ) {
    try {
      
      const messages: ExpoPushMessage[] = [];
      const currentUserInfo = await User.findOneByOrFail({ id: currentUser.id });
  
      for await (const friend of friends) {
        const token = friend?.notificationToken;
  
        const hasFriendAcceptedNotificationFromMe =
          await FriendshipService.checkIfFriendAcceptsMyNotification(
            friend.id,
            currentUser
          );
  
        if (token && hasFriendAcceptedNotificationFromMe) {
          messages.push({
            to: token,
            sound: "default",
            title: currentUserInfo.username,
            body: `${currentUserInfo.username}, is ${signalData.statusMessage} ${signalData.when.toLowerCase()}`,
          });
        }
      }
  
      this.expo.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.log(error)
    }
  }
}
