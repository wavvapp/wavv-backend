import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "./entity/User";
import { Friendship } from "./entity/Friendship";
import { Signal } from "./entity/Signal";
import { FriendSignal } from "./entity/FriendSignal";

export const MIGRATION_FILES =
  process.env.NODE_ENV === "development"
    ? ["./src/database/migrations/**/*.ts"]
    : ["./dist/database/migrations/**/*.js"];

const isTest = process.env.NODE_ENV === "test";
const database = (isTest ? "test_" : "") + process.env.POSTGRES_DB;

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database,
  migrationsTransactionMode: "each",
  namingStrategy: new SnakeNamingStrategy(),
  entities: [User, Friendship, Signal, FriendSignal],
  migrationsRun: false,
  migrations: MIGRATION_FILES,
  synchronize: false,
  poolSize: 10,
};

export default new DataSource(dataSourceOptions);
