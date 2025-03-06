import { In } from "typeorm";
import { Friendship } from "../entity/friendship.entity";
import { Group } from "../entity/group.entity";
import { User } from "../entity/user.entity";
import { AppUser } from "../types/auth";

export class GroupsService {
  static async createGroup(name: string, user: User) {
    const newGroup = new Group();
    newGroup.owner = user;
    newGroup.name = name;

    return newGroup.save();
  }

  static async getMyGroups(user: User) {
    return await Group.find({
      select: {
        id: true,
        name: true,
      },
      where: {
        owner: {
          id: user.id,
        },
      },
    });
  }

  static async update(id: string, updatedGroup: Partial<Group>) {
    const group = await GroupsService.getById(id);
    if (updatedGroup.name) group.name = updatedGroup.name;

    return await group.save();
  }

  static async getById(id: string) {
    return await Group.findOneByOrFail({ id });
  }

  static async deleteById(id: string) {
    return await Group.delete({ id });
  }

  async addGroupMembers(friendsId: string[], user: AppUser, groupId: string) {
    const group = await GroupsService.getById(groupId);

    const friendships = await Friendship.find({
      where: {
        user: {
          id: user.id,
        },
        friend: {
          id: In(friendsId),
        },
      },
    });

    return await this.addMemberIfNotExists(group, friendships);
  }

  async removeGroupMembers(friendsId: string[], user: AppUser, groupId: string) {
    const group = await GroupsService.getById(groupId);

    const friendships = await Friendship.find({
      where: {
        user: {
          id: user.id,
        },
        friend: {
          id: In(friendsId),
        },
      },
    });

    return await this.removeMembersIfExists(group, friendships);
  }

  private async addMemberIfNotExists(group: Group, friendShips: Friendship[]) {
    for (const friendShip of friendShips) {
      const membership = await Group.findOneBy({
        id: group.id,
        membership: { id: friendShip.id },
      });
      if (membership) continue;

      group.membership.push(friendShip);
    }

    return await group.save();
  }

  private async removeMembersIfExists(group: Group, friendShips: Friendship[]) {
    const newMembers: Friendship[] = [];
    const currentMembers = group.membership;

    for (const member of currentMembers) {
        if(friendShips.find(friendShip => friendShip.id === member.id)) continue;
        newMembers.push(member)
    }

    group.membership = newMembers;

    return await group.save()
  }
}
