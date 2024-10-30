import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  HttpError,
  JsonController,
  Param,
  Post,
  Put,
} from "routing-controllers";
import { Friendship } from "../entity/Friendship";
import { User } from "../entity/User";
import { IsNotEmpty } from "class-validator";

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
  @Get()
  async getAllFriendships(@CurrentUser() user: User): Promise<Friendship[]> {
    return Friendship.find({
      where: [{ user: { id: user.id } }, { friendId: user.id }],
      relations: ["user"],
    });
  }

  @Get("/:id")
  async getFriendship(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<Friendship> {
    const friendship = await Friendship.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!friendship) {
      throw new HttpError(404, "Friendship not found");
    }

    if (friendship.user.id !== user.id && friendship.friendId !== user.id) {
      throw new HttpError(403, "Not authorized to view this friendship");
    }

    return friendship;
  }

  @Post()
  async createFriendship(
    @Body() friendshipData: CreateFriendshipDto,
    @CurrentUser() user: User
  ): Promise<Friendship> {
    const existingFriendship = await Friendship.findOne({
      where: [
        { user: { id: user.id }, friendId: friendshipData.friendId },
        { user: { id: friendshipData.friendId }, friendId: user.id },
      ],
    });

    if (existingFriendship) {
      throw new HttpError(400, "Friendship already exists");
    }

    const friend = await Friendship.findOne({
      where: { id: friendshipData.friendId },
    });

    if (!friend) {
      throw new HttpError(404, "Friend not found");
    }

    const friendship = new Friendship();
    friendship.user = user;
    friendship.friendId = friendshipData.friendId;
    friendship.status = "pending";

    return Friendship.save(friendship);
  }

  @Put("/:id")
  async updateFriendshipStatus(
    @Param("id") id: string,
    @Body() updateData: UpdateFriendshipDto,
    @CurrentUser() user: User
  ): Promise<Friendship> {
    const friendship = await Friendship.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!friendship) {
      throw new HttpError(404, "Friendship not found");
    }

    if (friendship.friendId !== user.id) {
      throw new HttpError(403, "Not authorized to update this friendship");
    }

    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(updateData.status)) {
      throw new HttpError(400, "Invalid status");
    }

    friendship.status = updateData.status;
    return Friendship.save(friendship);
  }

  @Delete("/:id")
  async deleteFriendship(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<void> {
    const friendship = await Friendship.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!friendship) {
      throw new HttpError(404, "Friendship not found");
    }

    if (friendship.user.id !== user.id && friendship.friendId !== user.id) {
      throw new HttpError(403, "Not authorized to delete this friendship");
    }

    await Friendship.remove(friendship);
  }
}
