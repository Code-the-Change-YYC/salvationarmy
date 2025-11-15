import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

export default defineConfig({
  schema: [
    "./src/server/db/schema.ts", // data schema
    "./src/server/db/auth-schema.ts", // auth schema
    "./src/server/db/booking-schema.ts", // booking schema
    "./src/server/db/trip-schema.ts", // trip schema
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["salvationarmy_*"],
}) satisfies Config;
