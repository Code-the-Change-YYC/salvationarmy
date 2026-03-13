import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import RegisterAccountEmailTemplate from "@/app/_components/common/emails/register-account";
import ResetPasswordEmailTemplate from "@/app/_components/common/emails/reset-password";
import { resend } from "@/lib/emails";
import { db } from "@/server/db";
import { member as memberTable, organization as organizationTable } from "@/server/db/auth-schema";

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
      phoneNumber: {
        type: "string",
        required: false,
        input: false,
      },
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
      // check if Resend is configured
      if (!resend) {
        console.warn("Resend API key not configured, skipping email");
        return;
      }

      // invite flow to check if the user is being invited or resetting their password
      // 1. if the user is being invited
      const isInvitation = url.includes("complete-registration");
      if (isInvitation) {
        try {
          await resend.emails.send({
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
        try {
          await resend.emails.send({
            from: `Salvation Army Navigation Center <no-reply@notifications.burtonjong.dev>`,
            to: user.email,
            subject: "Reset your password",
            react: ResetPasswordEmailTemplate({
              resetUrl: url,
              userEmail: user.email,
              username: user.name,
            }),
          });
        } catch (error) {
          console.error("Error sending password reset email:", error);
        }
      }
    },
  },
  plugins: [
    nextCookies(),
    organization({
      allowUserToCreateOrganization: async (user) => {
        //Check if the user is part of the admin org
        const listOfMembers = await db
          .select()
          .from(memberTable)
          .where(
            and(
              eq(memberTable.userId, user.id),
              eq(
                memberTable.organizationId,
                db
                  .select({ id: organizationTable.id })
                  .from(organizationTable)
                  .where(eq(organizationTable.slug, "admins"))
                  .limit(1),
              ),
            ),
          )
          .limit(1);

        return (
          listOfMembers.length !== 0 &&
          (listOfMembers[0]?.role === "admin" || listOfMembers[0]?.role === "owner")
        );
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
