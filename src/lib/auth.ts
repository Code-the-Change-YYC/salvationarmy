import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import RegisterAccountEmailTemplate from "@/app/_components/common/emails/register-account";
import { resend } from "@/lib/emails";
import { db } from "@/server/db";

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
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // need this to be false so they can accept and fill out fields first
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // invite flow to check if the user is being invited or resetting their password

      // 1. if the user is being invited
      const isInvitation = url.includes("complete-registration");

      if (isInvitation) {
        try {
          resend.emails.send({
            from: `Salvation Army Navigation Center <no-reply@notifications.burtonjong.dev>`,
            to: user.email,
            subject: "Reset your password",
            react: RegisterAccountEmailTemplate({
              username: user.name,
              resetUrl: url,
              userEmail: user.email,
            }),
          });
        } catch (error) {
          console.error("Error sending invitation email:", error);
        }
      } else {
        // 2. todo: handle normal password reset
      }
    },
  },
  plugins: [
    nextCookies(),
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Check if user has admin role
        const member = await db.query.member.findFirst({
          where: (member, { eq }) => eq(member.userId, user.id),
        });
        return member?.role === "admin";
      },
    }),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Set active organization on first login
          // This is useful so users don't have to manually select their org
          const userMemberships = await db.query.member.findMany({
            where: (member, { eq }) => eq(member.userId, session.userId),
          });

          if (userMemberships.length > 0) {
            // Set their primary organization as active
            return {
              data: {
                ...session,
                activeOrganizationId: userMemberships[0]?.organizationId,
              },
            };
          }

          return { data: session };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
