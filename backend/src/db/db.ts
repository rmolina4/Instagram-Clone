import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../types/db.js";
const { Pool } = pg;

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export default db;
