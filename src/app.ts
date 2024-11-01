import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import express from "express";
import "reflect-metadata";
import {
  getMetadataArgsStorage,
  RoutingControllersOptions,
  useExpressServer,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { AuthController } from "./controllers/AuthController";
import { FriendSignalController } from "./controllers/FriendSignalController";
import { FriendshipController } from "./controllers/FriendshipController";
import { HomeController } from "./controllers/HomeController";
import { UsersController } from "./controllers/UsersController";
import {
  authorizationChecker,
  currentUserChecker,
} from "./middlewares/authorization";
import { ErrorHandler } from "./middlewares/errorHandler";
import { SignalController } from "./controllers/SignalsController";

const swaggerUi = require("swagger-ui-express");
const app = express();

const options: RoutingControllersOptions = {
  currentUserChecker,
  authorizationChecker,
  middlewares: [ErrorHandler],
  controllers: [
    HomeController,
    AuthController,
    UsersController,
    FriendSignalController,
    FriendshipController,
    SignalController,
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
