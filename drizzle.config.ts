import type { Config } from "drizzle-kit";

import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: [
    "./src/server/db/schema.ts", // data schema
    "./src/server/db/auth-schema.ts", // auth schema
  ],
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
  tablesFilter: ["salvationarmy_*"],
}) satisfies Config;
