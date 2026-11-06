import fs from "node:fs";
import pg from "pg";

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const rawUrl = process.env.POSTGRES_URL_NON_POOLING;
if (!rawUrl) {
  console.error("Falta POSTGRES_URL_NON_POOLING en el entorno.");
  process.exit(1);
}

const parsed = new URL(rawUrl);
parsed.searchParams.delete("sslmode");

const client = new pg.Client({
  connectionString: parsed.toString(),
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const tables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`);

const users = await client.query(
  `SELECT count(*)::int AS count FROM auth.users`
);

const realtime = await client.query(`
  SELECT schemaname, tablename
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
  ORDER BY tablename
`);

console.log(
  JSON.stringify(
    {
      publicTables: tables.rows.map((r) => r.table_name),
      authUsersCount: users.rows[0]?.count ?? 0,
      realtimePublicationTables: realtime.rows,
    },
    null,
    2
  )
);

await client.end();
