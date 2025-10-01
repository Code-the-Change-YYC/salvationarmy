import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	socialProviders: {
		discord: {
			clientId: "", //example
			clientSecret: "",
		},
		// add more providers here...
	},
	emailAndPassword: { enabled: false },
	plugins: [nextCookies()],
});
