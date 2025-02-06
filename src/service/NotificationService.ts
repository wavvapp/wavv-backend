import Expo from "expo-server-sdk";
import { Signal } from "../entity/Signal";
import { User } from "../entity/User";
import { UserService } from "./UserService";

type NotificationMessage = {
  to: string;
  sound: string;
  body: string;
};

export class NotificationService {
  expo = new Expo();
  userService = new UserService();

  async sendSignalNotificationTo(friends: User[], signal: Signal) {
    const messages: NotificationMessage[] = [];

    for await (const user of friends) {
      const token = user?.notificationToken;

      messages.push({
        to: token,
        sound: "default",
        body: `${user.username}, is available ${signal.status_message} at ${signal.when}`,
      });
    }

    this.expo.sendPushNotificationsAsync(messages);
  }
}
