const { readFileSync, existsSync } = require("fs")
const { join } = require("path")
const { Pool } = require("pg")

async function run() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.error("❌ Set SUPABASE_DB_URL or DATABASE_URL env var")
    console.error("   Get it from: https://supabase.com/dashboard/project/kwpfxhxcxsxlkubycxcu/settings/database")
    console.error("   Connection string > URI format")
    process.exit(1)
  }

  const sqlPath = join(__dirname, "..", "supabase-jarvis-schema.sql")
  if (!existsSync(sqlPath)) {
    console.error(`❌ SQL not found at ${sqlPath}`)
    process.exit(1)
  }

  const sql = readFileSync(sqlPath, "utf8")

  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

  try {
    console.log("⏳ Connecting to Supabase PostgreSQL...")
    await pool.query("SELECT 1")
    console.log("✅ Connected!")

    console.log("⏳ Executing migration...")
    await pool.query(sql)
    console.log("✅ Migration complete — all 7 JARVIS tables created")
  } catch (err) {
    console.error("❌ Migration failed:", err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
