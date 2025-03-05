import { CurrentUser, Get, JsonController } from "routing-controllers";
import { User } from "../entity/user.entity";
import PointsServices from "../service/points.service";
import { AppUser } from "../types/auth";

@JsonController("/api/points")
export class PointsController {
  @Get("/")
  async getUserPoint(@CurrentUser() currentUser: AppUser) {
    const user = await User.findOneByOrFail({ id: currentUser.id });
    const pointsService = new PointsServices();

    const points = await pointsService.getPointsByEmailId({id: user.id, sub: user.authId});
    return {...points, isIcpIdInSync: !!user.principal };
  }
}
