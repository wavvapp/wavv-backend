import "reflect-metadata";
import express from "express";
import { useExpressServer } from "routing-controllers";
import { HomeController } from "./controllers/HomeController";

const app = express();

useExpressServer(app, {
  controllers: [HomeController],
});

export default app;
