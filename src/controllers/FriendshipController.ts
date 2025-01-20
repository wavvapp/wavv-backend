import { IsNotEmpty } from "class-validator";
import {
  Body,
  CurrentUser,
  Get,
  HttpError,
  JsonController,
  Post,
} from "routing-controllers";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { FriendshipService } from "../service/FriendShipService";
import { AppUser } from "../types/Auth";

class CreateFriendshipDto {
  @IsNotEmpty()
  friendId: string;
}

class UpdateFriendshipDto {
  @IsNotEmpty()
  status: string;
}

@JsonController("/api/friends")
export class FriendshipController {
  @Get("/")
  async getAllFriendships(@CurrentUser() user: User): Promise<User[]> {
    const friendShips = await Friendship.find({
      where: { user: { id: user.id } },
      relations: ["friend"],
    });

    const friends = friendShips.map((friendShip) => friendShip.friend);

    return friends;
  }

  @Post("/")
  async createFriendship(
    @Body() friendshipData: CreateFriendshipDto,
    @CurrentUser() user: User
  ): Promise<Friendship> {
    const existingFriendship = await Friendship.findOne({
      where: [
        { user: { id: user.id }, friend: { id: friendshipData.friendId } },
      ],
    });

    if (existingFriendship) {
      throw new HttpError(400, "Friendship already exists");
    }

    const friend = await User.findOneByOrFail({ id: friendshipData.friendId });

    // Add new friend in my friendship
    const myFriendShip = new Friendship();
    myFriendShip.user = user;
    myFriendShip.friend = friend;
    myFriendShip.status = "pending";

    // Add my current profile in their friendship
    const theirFriendship = new Friendship();
    theirFriendship.user = friend;
    theirFriendship.friend = user;
    theirFriendship.status = "pending";

    await theirFriendship.save();
    return await myFriendShip.save();
  }

  @Post("/unfriend")
  async unfriendFriendship(
    @CurrentUser() currentUser: AppUser,
    @Body({ validate: true, required: true }) body: { friendId: string }
  ) {
    await FriendshipService.unfriend({ friendId: body.friendId, currentUser });

    return { message: "Friendship deleted successfully" };
  }
}
