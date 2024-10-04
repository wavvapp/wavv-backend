import {
  CurrentUser,
  Get,
  JsonController,
  QueryParam,
} from "routing-controllers";
import db from "../database/db";
import { AppUser } from "../types/Auth";
import { FindOptionsWhere, Like, Not } from "typeorm";
import { User } from "../entity/User";

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

    const users = await db.users.find({
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
}
