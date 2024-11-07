import {
  BadRequestError,
  CurrentUser,
  Get,
  JsonController,
  Param,
  QueryParam,
} from "routing-controllers";
import { FindOptionsWhere, Like, Not } from "typeorm";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";

@JsonController("/api/users")
export class UsersController {
  @Get("/")
  async getUsers(
    @CurrentUser({ required: true }) appUser: AppUser,
    @QueryParam("q") q: string
  ) {
    const filterObj: FindOptionsWhere<User> = {
      id: Not(appUser.id),
    };

    if (q) {
      filterObj["names"] = Like(`%${q}%`);
    }

    const users = await User.find({
      where: filterObj,
    });

    const friends = await Friendship.find({
      where: {
        user: { id: appUser.id },
      },
    });

    const friendIds = friends.map((friend) => friend.friend.id);

    return users.map((user) => ({
      id: user.id,
      name: user.names,
      profile: user.profilePictureUrl,
      bio: user.bio,
      email: user.email,
      username: user.username,
      isFriend: friendIds.includes(user.id),
    }));
  }

  @Get("/:username")
  async getUserByUsername(
    @CurrentUser({ required: true }) appUser: AppUser,
    @Param("username") username: string
  ) {
    const isUsernameTaken = await User.existsBy({ username });
    if (isUsernameTaken) return new BadRequestError("Username already exist");

    return {
      message: "Username is available.",
    };
  }
}
