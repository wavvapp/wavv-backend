import { Controller, Get } from "routing-controllers";
@Controller()
export class LivesController {
  @Get("/api")
  getHello() {
    return "Hello World!";
  }
}
