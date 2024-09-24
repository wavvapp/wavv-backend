// Ref: https://www.dmitry-ishkov.com/2022/03/migration-locks-for-typeorm.html
import CRC32 from "crc-32";
import DataSource, { dataSourceOptions } from "../data-source";

const MIGRATOR_SALT = 2053462845;

async function withAdvisoryLock(
  connection: typeof DataSource,
  callback: () => Promise<void>
): Promise<boolean> {
  const lockName =
    CRC32.str(dataSourceOptions.database as string) * MIGRATOR_SALT;
  let lock = false;
  try {
    const [{ pg_try_advisory_lock: locked }]: [
      { pg_try_advisory_lock: boolean }
    ] = await connection.manager.query(
      `SELECT pg_try_advisory_lock(${lockName})`
    );
    lock = locked;

    if (!lock) {
      return false;
    }

    await callback();

    return true;
  } finally {
    if (lock) {
      const [{ pg_advisory_unlock: wasLocked }]: [
        { pg_advisory_unlock: boolean }
      ] = await connection.manager.query(
        `SELECT pg_advisory_unlock(${lockName})`
      );

      if (!wasLocked) {
      }
    }
  }
}

export const migrateDatabase = async (connection: typeof DataSource) => {
  let success = false;
  while (!success) {
    success = await withAdvisoryLock(connection, async () => {
      await connection.runMigrations({
        transaction: "each",
      });
    });
    if (!success) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};
