import "reflect-metadata";
import express from "express";
import { getMetadataArgsStorage, useExpressServer } from "routing-controllers";
import { HomeController } from "./controllers/HomeController";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { AuthController } from "./controllers/AuthController";
import { currentUserChecker } from "./middlewares/authorization";
import { UsersController } from "./controllers/UsersController";
const swaggerUi = require("swagger-ui-express");
const app = express();

const options = {
  currentUserChecker,
  controllers: [HomeController, AuthController, UsersController],
};

useExpressServer(app, options);

const storage = getMetadataArgsStorage();

const spec = routingControllersToSpec(storage, options, {
  info: {
    description: "API Documentation for `SAC`",
    title: "API Documentation",
    version: "1.0.0",
  },
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

export default app;
