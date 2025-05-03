import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../types/db.js";
const { Pool } = pg;

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export default db;