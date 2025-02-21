import { Request, Response } from "express";
import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware
} from "routing-controllers";

@Middleware({ type: "after" })
export default class CustomErrorHandler
  implements ExpressErrorMiddlewareInterface
{
  error(error: HttpError | Error, req: Request, res: Response) {
    if (error instanceof HttpError && error.httpCode < 500) {
      return res.status(error.httpCode).json({
        message: error.message,
      });
    }

    console.log(error)

    return res.status(500).json({
      message: "internal server error",
    });
  }
}
