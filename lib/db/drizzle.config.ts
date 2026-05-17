import { defineConfig } from "drizzle-kit";
import path from "path";

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL or DATABASE_URL must be set. Ensure Supabase is provisioned.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
