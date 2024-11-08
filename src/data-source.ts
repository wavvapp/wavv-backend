import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Friendship } from "./entity/Friendship";
import { FriendSignal } from "./entity/FriendSignal";
import { Signal } from "./entity/Signal";
import { User } from "./entity/User";

export const MIGRATION_FILES =
  process.env.NODE_ENV === "development"
    ? ["./src/database/migrations/**/*.ts"]
    : ["./dist/database/migrations/**/*.js"];
    
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  migrationsTransactionMode: "each",
  namingStrategy: new SnakeNamingStrategy(),
  entities: [User, Friendship, Signal, FriendSignal],
  migrationsRun: false,
  migrations: MIGRATION_FILES,
  synchronize: false,
  poolSize: 10,
};

export default new DataSource(dataSourceOptions);
