import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    discord: {
      clientId: "", //example
      clientSecret: "",
    },
    // add more providers here...
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "driver",
        input: false, // users should not be able to set their own role
      },
    },
  },
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
