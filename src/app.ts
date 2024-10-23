import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import express from "express";
import "reflect-metadata";
import { getMetadataArgsStorage, useExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { AuthController } from "./controllers/AuthController";
import { FriendSignalController } from "./controllers/FriendSignalController";
import { FriendshipController } from "./controllers/FriendshipController";
import { HomeController } from "./controllers/HomeController";
import { UsersController } from "./controllers/UsersController";
import { currentUserChecker } from "./middlewares/authorization";

const swaggerUi = require("swagger-ui-express");
const app = express();

const options = {
  currentUserChecker,
  controllers: [
    HomeController,
    AuthController,
    UsersController,
    FriendSignalController,
    FriendshipController,
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
