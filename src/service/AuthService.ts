import { isEmail } from "class-validator";
import { Response } from "express";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import { CertSigningKey, JwksClient, RsaSigningKey } from "jwks-rsa";
import { BadRequestError } from "routing-controllers";
import { User } from "../entity/User";
import { Provider } from "../types/Auth";
import { InvitationService } from "./InvitationService";
import PointsServices from "./PointsServices";
import SignalService from "./SignalService";

type RequestBody = { names: string; email: string; username?: string };

const client = new JwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

class AuthService {
  private token: string;
  private pointsService = new PointsServices();

  constructor(token: string) {
    this.token = token;
  }

  private async handleAppleSignin(
    token: string,
    bodyPaylod: RequestBody,
    response: Response
  ) {
    const { names, email: bodyPayloadEmail, username } = bodyPaylod;

    return await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getKey,
        { algorithms: ["RS256"] },
        async (err, decoded) => {
          if (err) {
            console.error("JWT verification failed:", err.message);
            reject(err);
            return;
          }

          const decodeData = decoded as { email: string; sub: string };

          const email = bodyPayloadEmail || decodeData.email;

          if (!email && !isEmail(email)) {
            throw new BadRequestError("Email is required property.");
          }

          const user = await User.findOneBy({
            email,
          });

          if (!user) {
            const newUser = new User();

            newUser.email = email;
            newUser.names = names;
            newUser.username = username || "";
            newUser.provider = Provider.APPLE;
            newUser.authId = decodeData.sub;

            /**
             *
             * If the user does not have username, means their info data
             * Is accepted but not ready to be saved until user sends username as well.
             *
             */
            if (!newUser.username) {
              return response.status(202).json({
                message: "User info has been accepted for processing.",
              });
            }

            if (!names) {
              return response
                .status(400)
                .json({ message: "Name is required property." });
            }

            this.pointsService.registerUserOnCanister({ sub: decodeData.sub });

            await newUser.save();

            const userData = {
              id: newUser.id,
              email: newUser.email,
              names: newUser.names,
              phoneNumber: newUser.phoneNumber,
              emailVerified: newUser.emailVerified,
              provider: newUser.provider,
              profilePictureUrl: newUser.profilePictureUrl,
              username: newUser.username,
              sub: newUser.authId,
            };

            const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
              expiresIn: "3d",
            });

            const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
              expiresIn: "7d",
            });

            const signalService = new SignalService();
            await signalService.initiateSignalIfNotExist({
              ...userData,
              timezone: "",
            });

            return resolve({
              access_token,
              refresh_token,
              ...userData,
              inviteCode: InvitationService.generate(),
            });
          }

          const userData = {
            id: user.id,
            email: user.email,
            names: user.names,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            provider: user.provider,
            profilePictureUrl: user.profilePictureUrl,
            username: user.username,
            sub: user.authId,
          };

          const access_token = jwt.sign(userData, process.env.JWT_SECRET!, {
            expiresIn: "3d",
          });

          const refresh_token = jwt.sign(userData, process.env.JWT_SECRET!, {
            expiresIn: "7d",
          });

          return resolve({
            access_token,
            refresh_token,
            ...userData,
            inviteCode: InvitationService.generate(),
          });
        }
      );
    });
  }

  private async handleGoogleSignin(
    token: string,
    bodyPaylod: RequestBody,
    response: Response
  ) {}

  private getKey(header: JwtHeader, callback: SigningKeyCallback) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      if (key) {
        const signingKey =
          (key as CertSigningKey).publicKey ||
          (key as RsaSigningKey).rsaPublicKey;
        callback(null, signingKey);
      }
    });
  }

  async signin(
    provider: Provider,
    requestBody: RequestBody,
    response: Response
  ) {
    if (provider === Provider.APPLE) {
      return await this.handleAppleSignin(this.token, requestBody, response);
    }

    if (provider === Provider.GOOGLE) {
      return await this.handleGoogleSignin(this.token, requestBody, response)
    }
  }
}

export default AuthService;
