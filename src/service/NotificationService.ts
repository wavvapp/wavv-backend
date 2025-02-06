import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";
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
    const messages: ExpoPushMessage[] = [];
    const currentUserInfo = await User.findOneByOrFail({ id: currentUser.id });

    for await (const user of friends) {
      const token = user?.notificationToken;

      if (token) {
        messages.push({
          to: token,
          sound: "default",
          title: `See what ${currentUserInfo.username} is up to 💭`,
          body: `${currentUserInfo.username}, is ${signalData.statusMessage} at ${signalData.when}`,
        });
      }
    }

    this.expo.sendPushNotificationsAsync(messages);
  }
}
