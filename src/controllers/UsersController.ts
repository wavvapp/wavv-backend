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

    if (!user) return res.status(204).json({ mesage: "email not not foundf" })

    const friendsIhaveAddedd = await Friendship.find({
      where: { user: { id: user.id } },
    });

    const friendsWhoAddedMe = await Friendship.find({
      where: { friend: { id: user.id } },
    })

    const signalsOfFriendsWhoAddedMeToTheirCurrentSignal = await Friendship.find({
      relations: ["user", "friendSignal.signal", "friendSignal.friendship"],
      where: {
        friendSignal: {
          friendship: {
            friend: {
              id: user.id
            }
          }
        }
      },
    });

    const testOutFriendsignal = await Signal.find({
      where: { id: "3287ca54-c44f-45b5-8738-4629a4d0722d" }, relations: ["friendSignal.friendship.friend"],
    })

    let friendSignalIds: string[] = []
    signalsOfFriendsWhoAddedMeToTheirCurrentSignal.map(signal => {
      signal.friendSignal.map((friendSignal) => {
        friendSignalIds.push(friendSignal.id)
        return
      })
      return
    }
    )


    /// then delete them all

    // signalsOfFriendsWhoAddedMeToTheirCurrentSignal.forEach(async (signal) =>
    //   await FriendSignal.remove(signal.friendSignal)
    // )
    // await Friendship.remove(friendsIhaveAddedd)
    // await Friendship.remove(friendsWhoAddedMe)
    // await Signal.delete({ user: { id: user.id } }) // Just delete the signal since we always have one anyway and i assume that the people who can see it are also gone by default
    // await User.remove(user)

    res.status(200).json({
      testOutFriendsignal,
      friendSignalIds,
      signalsOfFriendsWhoAddedMeToTheirCurrentSignal
    })
  }
}
