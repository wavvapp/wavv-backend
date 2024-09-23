import { Controller, Get, Param, Post, Put } from "routing-controllers";
import { OpenAPI, routingControllersToSpec } from 'routing-controllers-openapi'
import { homeControllerDocs } from "../documentation/Home";

@Controller()
export class HomeController {
  @Get("/api")
  @OpenAPI(homeControllerDocs.getHello)
  getHello() {
    return "Hello World!";
  }
  @Post("/new-user")
  @OpenAPI(homeControllerDocs.createUser as any)
  createUser(@Param('userId') userId: string) {
    return "Please provide the necessary user details";
  }
}
