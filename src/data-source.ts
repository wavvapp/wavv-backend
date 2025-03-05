import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { FriendSignal } from "./entity/friend.signal.entity";
import { Friendship } from "./entity/friendship.entity";
import { Notification } from "./entity/notification.entity";
import { Signal } from "./entity/signal.entity";
import { User } from "./entity/user.entity";

export const MIGRATION_FILES =
  process.env.NODE_ENV === "development"
    ? ["./src/database/migrations/**/*.ts"]
    : ["./dist/database/migrations/**/*.js"];
    
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  migrationsTransactionMode: "each",
  namingStrategy: new SnakeNamingStrategy(),
  entities: [User, Friendship, Signal, FriendSignal, Notification],
  migrationsRun: false,
  migrations: MIGRATION_FILES,
  ssl: false,
  synchronize: false,
  poolSize: 10,
};

export default new DataSource(dataSourceOptions);
