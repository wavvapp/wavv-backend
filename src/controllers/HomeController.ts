import { Body, Controller, Get, Param, Post } from "routing-controllers";
@Controller()
export class HomeController {
  @Get("/api")
  getHello() {
    return "Hello World!";
  }
  @Post("/new-user")
  createUser(@Body() body: { name: string, phoneNumber: string, address: string }) {
    return "Please provide the necessary user details";
  }
}