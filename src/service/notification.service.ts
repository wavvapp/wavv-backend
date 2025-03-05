import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { User } from "../entity/user.entity";
import { AppUser } from "../types/auth";
import { FriendshipService } from "./friendship.service";
import { UserService } from "./user.service";


type BuildNotificationObjParam = {
  token: string;
  body: string;
  title: string;
};

type SendPushNotificationsToParam = {
  token: string;
  body: string;
  title: string;
};

export class NotificationService {
  private expo = new Expo();
  userService = new UserService();

  async sendSignalNotificationToFriends(
    friends: User[],
    currentUser: AppUser,
    signalData: {
      statusMessage: string;
      when: string;
    }
  ) {
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
        const body = signalData.statusMessage;
        const title = currentUserInfo.username;

        messages.push(this.buildNotificationObj({ token, title, body }));
      }
    }

    this.expo.sendPushNotificationsAsync(messages);
  }

  async sendPushNotificationsTo({
    token,
    body,
    title,
  }: SendPushNotificationsToParam) {
    if (token) {
      const message = this.buildNotificationObj({
        title,
        token,
        body,
      });

      await this.expo.sendPushNotificationsAsync([message]);
    }
  }

  private buildNotificationObj({
    token,
    body,
    title,
  }: BuildNotificationObjParam): ExpoPushMessage {
    return {
      to: token,
      sound: "default",
      body,
      title,
    };
  }
}
