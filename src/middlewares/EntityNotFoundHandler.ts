import {
    ExpressErrorMiddlewareInterface,
    HttpError,
    Middleware,
    NotFoundError,
} from "routing-controllers";
import { EntityNotFoundError } from "typeorm";

@Middleware({ type: "after" })
class EntityNotFoundHandler implements ExpressErrorMiddlewareInterface {
  error(error: HttpError | Error) {
    if (error instanceof EntityNotFoundError) {
      throw new NotFoundError();
    } else {
      throw error;
    }
  }
}

export default EntityNotFoundHandler;
