import { Request, Response } from "express";
import {
    ExpressErrorMiddlewareInterface,
    HttpError,
    Middleware
} from "routing-controllers";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: HttpError | Error, req: Request, res: Response) {
    let errorStatus = 500;
    let errorMessage = "internal server error";
    let respondWithError = false;

    try {
      if (!res.writableEnded && error) {
        respondWithError = true;
        if (error instanceof HttpError && error.httpCode < 500) {
          errorStatus = error.httpCode;
          errorMessage = error.message;
        }
        else {
          console.log(
            `${JSON.stringify({
              error: error["message"] || error,
              stack: error["stack"] || "",
            })}`
          );
        }
      }
    } catch (e) {
      console.log(`Error in error middleware! ${e}`);
    }

    return new Promise<void>((resolve) => {
      if (respondWithError) {
        res.status(errorStatus).json({
          message: errorMessage,
        });
      }
      resolve();
    });
  }
}
