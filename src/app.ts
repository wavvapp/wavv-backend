import "reflect-metadata";
import express from "express";
import { getMetadataArgsStorage, useExpressServer } from "routing-controllers";
import { HomeController } from "./controllers/HomeController";
import { routingControllersToSpec } from "routing-controllers-openapi";
const swaggerUi = require('swagger-ui-express');
const app = express();

useExpressServer(app, {
  controllers: [HomeController],
});

const storage = getMetadataArgsStorage()
const spec = routingControllersToSpec(storage)

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

export default app;
