import "reflect-metadata";
import express from "express";
import { getMetadataArgsStorage, useExpressServer } from "routing-controllers";
import { HomeController } from "./controllers/HomeController";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { AuthController } from "./controllers/AuthController";
const swaggerUi = require("swagger-ui-express");
const app = express();

useExpressServer(app, {
  controllers: [HomeController, AuthController],
});

const storage = getMetadataArgsStorage();
const spec = routingControllersToSpec(storage);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

export default app;
