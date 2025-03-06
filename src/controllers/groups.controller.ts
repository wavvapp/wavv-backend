import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
} from "routing-controllers";
import { User } from "../entity/user.entity";
import { GroupsService } from "../service/group.service";
import { AppUser } from "../types/auth";

@Authorized()
@JsonController("/api/groups")
export class GroupController {
  @Post("")
  async createGroup(
    @CurrentUser() currentUser: AppUser,
    @Body() body: { name: string }
  ) {
    const user = await User.findOneByOrFail({ id: currentUser.id });
    return await GroupsService.createGroup(body.name, user);
  }

  @Get("")
  async getMyGroups(@CurrentUser() currentUser: AppUser) {
    const user = await User.findOneByOrFail({ id: currentUser.id });
    return await GroupsService.getMyGroups(user);
  }

  @Put("")
  async updateGroup(@Body() body: { id: string; name: string }) {
    return await GroupsService.update(body.id, { name: body.name });
  }

  @Get(":groupId")
  async getGroup(@Param("groupId") groupId: string) {
    return GroupsService.getById(groupId);
  }

  @Delete(":groupId")
  async deleteGroup(@Param("groupId") groupId: string) {
    return GroupsService.deleteById(groupId);
  }

  @Put("/members")
  async addGroupMembers(
    @Body() { id, friendIds }: { id: string; friendIds: string[] },
    @CurrentUser() currentUser: AppUser
  ) {
    const groupsService = new GroupsService();
    return await groupsService.addGroupMembers(friendIds, currentUser, id);
  }

  @Delete("/members")
  async removeGroupMember(
    @Body() { id, friendIds }: { id: string; friendIds: string[] },
    @CurrentUser() currentUser: AppUser
  ) {
    const groupsService = new GroupsService();
    return await groupsService.removeGroupMembers(friendIds, currentUser, id);
  }
}
