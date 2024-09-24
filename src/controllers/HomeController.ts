import { Body, Controller, Get, Param, Post } from "routing-controllers";
@Controller()
export class HomeController {
  @Get("/api")
  getHello() {
    return "Hello World!";
  }
}