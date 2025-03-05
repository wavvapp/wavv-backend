import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware,
  NotFoundError,
} from "routing-controllers";
import { EntityNotFoundError } from "typeorm";

@Middleware({ type: "after" })
class TypeOrmErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: HttpError | Error) {
    if (error instanceof EntityNotFoundError) {
      throw new NotFoundError("Resource not found!");
    }
    throw error;
  }
}

export default TypeOrmErrorHandler;
