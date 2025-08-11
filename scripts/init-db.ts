import { neon } from "@neondatabase/serverless"

async function main() {
  const sql = neon(process.env.POSTGRES_URL!)
  await sql`
    CREATE TABLE IF NOT EXISTS access_codes (
      id BIGSERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      owner TEXT NOT NULL,
      role TEXT CHECK (role IN ('admin','manager','viewer')),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  console.log("Database initialized: access_codes table is ready.")
}

main().catch((e) => {
  console.error("Failed to initialize database:", e)
})
