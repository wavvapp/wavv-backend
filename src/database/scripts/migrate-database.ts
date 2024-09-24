import { DataSource } from "typeorm";
import { dataSourceOptions, MIGRATION_FILES } from "../../data-source";
import { migrateDatabase } from "../utls";

const extra = { options: "-c lock_timeout=2s" };

(async () => {
  const ds = new DataSource({
    ...dataSourceOptions,
    logging: ["query", "error", "schema"],
    migrations: MIGRATION_FILES,
    extra,
  });
  await ds.initialize();
  await migrateDatabase(ds);
  await ds.destroy();
})().catch((e) => {
});
