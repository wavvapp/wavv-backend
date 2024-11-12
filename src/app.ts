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
import { AuthController } from "./controllers/AuthController";
import { FriendshipController } from "./controllers/FriendshipController";
import { FriendSignalController } from "./controllers/FriendSignalController";
import { HomeController } from "./controllers/HomeController";
import { PointsController } from "./controllers/PointsController";
import { SignalController } from "./controllers/SignalsController";
import { UsersController } from "./controllers/UsersController";
import {
  authorizationChecker,
  currentUserChecker,
} from "./middlewares/authorization";
import EntityNotFoundHandler from "./middlewares/EntityNotFoundHandler";
import { ErrorHandler } from "./middlewares/errorHandler";

const app = express();

const options: RoutingControllersOptions = {
  currentUserChecker,
  authorizationChecker,
  middlewares: [EntityNotFoundHandler, ErrorHandler],
  controllers: [
    HomeController,
    AuthController,
    UsersController,
    FriendSignalController,
    FriendshipController,
    SignalController,
    PointsController,
  ],
};

useExpressServer(app, options);

const storage = getMetadataArgsStorage();

const schemas = validationMetadatasToSchemas({
  refPointerPrefix: "#/components/schemas/",
});

const spec = routingControllersToSpec(storage, options, {
  info: {
    description: "API Documentation for `SAC`",
    title: "API Documentation",
    version: "1.0.0",
  },
  // @ts-ignore
  components: { schemas },
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

export default app;
