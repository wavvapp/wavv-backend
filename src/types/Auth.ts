export type AppUser = {
  id: string;
  email: string;
  names: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  profilePictureUrl?: string;
  sub: string;
  timezone: string;
};


export enum Provider  {
  GOOGLE = "google",
  APPLE = "apple"
}
