import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Param,
  Patch,
  QueryParam,
} from "routing-controllers";
import { Brackets } from "typeorm";
import { UpdateProfileBody } from "../dto/auth/login.dto";
import { Friendship } from "../entity/friendship.entity";
import { User } from "../entity/user.entity";
import { UserService } from "../service/user.service";
import { AppUser } from "../types/auth";

@Authorized()
@JsonController("/api/users")
export class UsersController {
  @Get("/")
  async getUsers(
    @CurrentUser({ required: true }) appUser: AppUser,
    @QueryParam("q") q: string
  ) {
    const usersSearchBuilder = User.createQueryBuilder("user").where(
      "user.id != :appUserId",
      { appUserId: appUser.id }
    );

    if (q) {
      usersSearchBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("user.names ILIKE :search", { search: `%${q}%` }).orWhere(
            "user.username ILIKE :search",
            { search: `%${q}%` }
          );
        })
      );
    }

    const users = await usersSearchBuilder.getMany();

    const friendships = await Friendship.find({
      relations: ["friend"],
      where: {
        user: { id: appUser.id },
      },
    });

    const friendIds = friendships.map((friendship) => friendship.friend.id);

    return users.map((user) => ({
      ...user,
      isFriend: friendIds.includes(user.id),
    }));
  }

  @Get("/:username")
  async getUserByUsername(@Param("username") username: string) {
    const isUsernameTaken = await User.existsBy({ username });
    if (isUsernameTaken) return new BadRequestError("Username already exist");

    return {
      message: "Username is available.",
    };
  }

  @Delete("/")
  async deleteMyAccount(@CurrentUser() user: AppUser) {
    const isDeleted = await UserService.deleteMyAccount(user);
    return {
      message: "User has been deleted successfully",
      isDeleted,
    };
  }

  @Patch("/")
  async updateProfile(
    @Body({ required: false, validate: true }) body: UpdateProfileBody,
    @CurrentUser({ required: true }) appUser: AppUser
  ) {
    /**
     *
     * Update profile logic
     *
     */
    const {
      names,
      email,
      phoneNumber,
      location,
      bio,
      profilePictureUrl,
      username,
      preferances,
      notificationToken
    } = body;

    const data: Record<string, string | boolean | object> = {};

    if (names) data.names = names;
    if (email) data.email = email;
    if (phoneNumber) data.phoneNumber = phoneNumber;
    if (location) data.location = location;
    if (bio) data.bio = bio;
    if (profilePictureUrl) data.profilePictureUrl = profilePictureUrl;
    if (username) {
      data.username = username;
      const usernameExist = await User.existsBy({ username });
      if (usernameExist)
        return new BadRequestError("Username is already taken");
    }

    if (preferances) {
      const allowNotification = preferances.allowNotification;
      const preferance = {
        allowNotification,
      };

      if(allowNotification && !notificationToken) {
        return new BadRequestError("NotificationToken, required");
      }

      data.notificationToken = notificationToken || ""
      data.preferances = preferance;
    }

    await User.update(appUser.id, data);

    return {
      message: "Profile updated successfully.",
    };
  }
}
