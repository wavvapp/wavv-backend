import { CurrentUser, Get, JsonController } from "routing-controllers";
import PointsServices from "../service/PointsServices";
import { AppUser } from "../types/Auth";

@JsonController("/api/points")
export class PointsController {
    @Get("/")
    async getUserPoint( @CurrentUser() user: AppUser ) {
        const pointsService = new PointsServices();
        return await pointsService.getPointsByUserId(user.id);
    }
}
