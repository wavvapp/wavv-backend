import { CurrentUser, Get, JsonController } from "routing-controllers";
import { User } from "../entity/User";
import PointsServices from "../service/PointsServices";
import { AppUser } from "../types/Auth";

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
