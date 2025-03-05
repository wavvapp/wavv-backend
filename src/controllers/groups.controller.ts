import { JsonController } from "routing-controllers";

@JsonController("/api/groups")
export class GroupController {
    async createGroup() {}
    async getMyGroups() {}
    async deleteGroup() {}
    async updateGroup() {}
    async addGroupMember() {}
    async removeGroupMember() {}
}
