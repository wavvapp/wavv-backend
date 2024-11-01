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

    return users.map((e) => {
      return {
        id: e.id,
        name: e.names,
        profile: e.profilePictureUrl,
        bio: e.bio,
        email: e.email,
      };
    });
  }

  @Get(":username")
  async updateProfile(
    @CurrentUser({ required: true }) appUser: AppUser,
    @Param("username") username: string
  ) {
    const isUsernameTaken = await User.existsBy({ username });
    if (isUsernameTaken) return new BadRequestError("Username already taken.")

    return {
      message: "Username is available.",
    };
  }
}
