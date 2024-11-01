import {
  BadRequestError,
  CurrentUser,
  Get,
  JsonController,
  Param,
  QueryParam,
} from "routing-controllers";
import { FindOptionsWhere, Like, Not } from "typeorm";
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

    return users.map((user) => {
      return {
        id: user.id,
        name: user.names,
        profile: user.profilePictureUrl,
        bio: user.bio,
        email: user.email,
        username: user.username
      };
    });
  }

  @Get(":username")
  async getUserByUsername(
    @CurrentUser({ required: true }) appUser: AppUser,
    @Param("username") username: string
  ) {
    const isUsernameTaken = await User.existsBy({ username });
    if (isUsernameTaken) return new BadRequestError("Username already exist")

    return {
      message: "Username is available.",
    };
  }
}
