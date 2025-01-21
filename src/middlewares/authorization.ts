import jwt, { JwtPayload } from "jsonwebtoken";
import { Action, UnauthorizedError } from "routing-controllers";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";

const isValid = (payload: JwtPayload) => {
  const expiresAt = payload.exp || 0;
  const now = Date.now() / 1000;
  return expiresAt > now;
};

export const currentUserChecker = async (
  action: Action
): Promise<AppUser | null> =>
  new Promise((resolve, reject) => {
    const request = action.request as Request;
    const headers = request?.headers as { authorization?: string };

    const token = headers["authorization"];

    const bearer = token?.split(" ")[1];

    if (!bearer) {
      throw new UnauthorizedError();
    }

    jwt.verify(bearer, process.env.JWT_SECRET!, (err, decoded) => {
      if (err || !isValid(decoded as JwtPayload)) {
        reject(new UnauthorizedError());
      } else {
        const jwtPayload = decoded as JwtPayload;
        const userData = jwtPayload as AppUser;

        
        if (userData) {
          User.findOneBy({ id: userData.id }).then(user => {
            if (user) {
              resolve(userData);
              return
            }
            resolve(null)
          })
        } else {
          resolve(null);
        }
      }
    });
  });

export const authorizationChecker = async (action: Action, roles: string[]) => {
  const currentUser = await currentUserChecker(action);
  if (!currentUser) {
    return false;
  }

  return true;
};
