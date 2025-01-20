import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import dotenv from "dotenv";
import { DB } from "../types/db";
dotenv.config();

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export default db;
