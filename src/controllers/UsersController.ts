import {
  BadRequestError,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Param,
  QueryParam,
  Res,
} from "routing-controllers";
import { FindOptionsWhere, IsNull, Like, Not } from "typeorm";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";
import { Response } from "express";
import { Signal } from "../entity/Signal";

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
      filterObj["username"] = Not(IsNull());
    }

    const users = await User.find({
      where: filterObj,
    });

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

  @Delete("/:email")
  async getUserByEmail(@Param("email") email: string, @Res() res: Response) {
    // I don't think we have an admin, if we do then make them be the only ones permitted to do so.
    const user = await User.findOneByOrFail({ email })

    try {
        if (!user) return res.status(204).json({ message: "email not found" });

        await User.delete(user.id);

        return {
            message: "Done deleting user"
        };
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred while deleting user" });
    }
  }
}
