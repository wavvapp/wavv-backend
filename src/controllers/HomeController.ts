import { Controller, Get } from "routing-controllers";

@Controller()
export class HomeController {
  @Get("/api")
  getHello() {
    return "Hello World!";
  }
}
