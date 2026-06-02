const { createClient } = require("@supabase/supabase-js")

const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cGZ4aHhjeHN4bGt1YnljeGN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTEyNzA3NiwiZXhwIjoyMDkwNzAzMDc2fQ.jxBaKJ2kZ5QqH2Voe35sc1HNUBoDyC1YHRAxIsZ0niw"
const SUPABASE_URL = "https://kwpfxhxcxsxlkubycxcu.supabase.co"

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function run() {
  // Try creating a simple function first to test SQL access
  const { error: fnError } = await supabase.rpc("extensions", {}).maybeSingle()
  console.log("RPC test:", fnError?.message || "no error")

  // Try to create the table through the REST API by directly using fetch
  // The Supabase REST API with service_role key can access pg_catalog
  const headers = {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  }

  // Try creating a simple table via pg_catalog
  const testRes = await fetch(`${SUPABASE_URL}/rest/v1/pg_catalog.pg_tables?schemaname=eq.public`, { headers })
  const testData = await testRes.text()
  console.log("pg_catalog access:", testRes.status, testData.substring(0, 200))
}

run().catch(console.error)
