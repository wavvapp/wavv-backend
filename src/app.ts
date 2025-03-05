import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import express from "express";
import "reflect-metadata";
import {
  getMetadataArgsStorage,
  RoutingControllersOptions,
  useExpressServer,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { AuthController } from "./controllers/auth.controller";
import { FriendSignalController } from "./controllers/friends.signal.controller";
import { FriendshipController } from "./controllers/friendships.controller";
import { GroupController } from "./controllers/groups.controller";
import { InvitationController } from "./controllers/invitations.controller";
import { LivesController } from "./controllers/livez.controller";
import { PointsController } from "./controllers/points.controller";
import { SignalController } from "./controllers/signals.controller";
import { UsersController } from "./controllers/users.controller";
import {
  authorizationChecker,
  currentUserChecker,
} from "./middlewares/authorization.middleware";
import CustomErrorHandler from "./middlewares/error-handlers/custom.error.handler.middleware";
import TypeOrmErrorHandler from "./middlewares/error-handlers/typeorm.error.handler.middleware";

const app = express();
const options: RoutingControllersOptions = {
  currentUserChecker,
  authorizationChecker,
  middlewares: [
    TypeOrmErrorHandler,
    CustomErrorHandler
  ],
  controllers: [
    LivesController,
    AuthController,
    UsersController,
    FriendSignalController,
    FriendshipController,
    SignalController,
    PointsController,
    InvitationController,
    GroupController
  ],
  cors: true,
  defaultErrorHandler: false
};

useExpressServer(app, options);

const storage = getMetadataArgsStorage();

const schemas = validationMetadatasToSchemas({
  refPointerPrefix: "#/components/schemas/",
});

const spec = routingControllersToSpec(storage, options, {
  info: {
    description: "API Documentation for `Wavv`",
    title: "API Documentation",
    version: "1.0.0",
  },
  // eslint-disable-next-line
  // @ts-ignore
  components: { schemas },
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

export default app;
