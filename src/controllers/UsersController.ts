import {
  BadRequestError,
  CurrentUser,
  Get,
  JsonController,
  Param,
  QueryParam,
} from "routing-controllers";
import { Brackets } from "typeorm";
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

    const usersSearchBuilder = User.createQueryBuilder('user')
    .where('user.id != :appUserId', { appUserId: appUser.id })

    if(q){
      usersSearchBuilder.andWhere(new Brackets(qb => {
        qb.where('user.names ILIKE :search', { search: `%${q}%` })
          .orWhere('user.username ILIKE :search', { search: `%${q}%` });
      }))
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
}
