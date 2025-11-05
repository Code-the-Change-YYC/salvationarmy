import { env } from "@/env";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/server/db/schema.ts", // data schema
    "./src/server/db/auth-schema.ts", // auth schema
    "./src/server/db/booking-schema.ts", // booking schema
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["salvationarmy_*"],
}) satisfies Config;
