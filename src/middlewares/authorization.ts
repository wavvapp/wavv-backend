import jwt, { JwtPayload } from "jsonwebtoken";
import { Action, UnauthorizedError } from "routing-controllers";
import { BERLIN_TIME } from "../constants/timezone";
import { User } from "../entity/User";
import { AppUser } from "../types/Auth";

const isValid = (payload: JwtPayload) => {
  const expiresAt = payload.exp || 0;
  const now = Date.now() / 1000;
  return expiresAt > now;
};

type Headers = {
  "x-timezone": string,
  authorization: string
}

export const currentUserChecker = async (
  action: Action
): Promise<AppUser | null> =>
  new Promise((resolve, reject) => {
    const request = action.request as Request;
    const headers = request?.headers as unknown as Headers;

    const token = headers["authorization"];

    const bearer = token?.split(" ")[1];

    if (!bearer) {
      throw new UnauthorizedError("Unauthorized");
    }

    jwt.verify(bearer, process.env.JWT_SECRET!, (err, decoded) => {
      if (err || !isValid(decoded as JwtPayload)) {
        reject(new UnauthorizedError("Unauthorized"));
      } else {
        const jwtPayload = decoded as JwtPayload;
        const timezone = headers["x-timezone"] || BERLIN_TIME as string;
        const userData = {...jwtPayload, timezone} as AppUser;

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

export const authorizationChecker = async (action: Action) => {
  const currentUser = await currentUserChecker(action);
  if (!currentUser) {
    return false;
  }

  return true;
};
