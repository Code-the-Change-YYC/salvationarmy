import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { adminProcedure, createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const organizationRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    try {
      const organizations = await auth.api.listOrganizations({
        headers: await headers(),
      });

      return organizations;
    } catch (error) {
      throw new TRPCError({
        cause: error,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
  inviteUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["member", "admin", "owner"]),
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUserMember = await ctx.db.query.member.findFirst({
        where: (member, { eq }) => eq(member.userId, ctx.session.user.id),
      });

      if (currentUserMember?.role !== "admin" && currentUserMember?.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can invite users",
        });
      }

      try {
        // create a user with a random password
        const randomPassword = uuidv4();

        const newUser = await auth.api.signUpEmail({
          body: {
            email: input.email,
            name: "", // blank so they can fill it in later
            password: randomPassword,
          },
        });

        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // add the newly created user to the organization with the specified role
        await auth.api.addMember({
          body: {
            userId: newUser.user.id,
            organizationId: input.organizationId,
            role: input.role,
          },
        });

        // send the invitation email using the forgot password flow
        console.log("Sending password reset email to:", input.email);
        const response = await auth.api.requestPasswordReset({
          body: {
            email: input.email,
            redirectTo: "/complete-registration",
          },
        });

        console.log("Password reset response:", response);

        return {
          success: true,
          userId: newUser.user.id,
          email: input.email,
        };
      } catch (error) {
        console.error("Error inviting user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invitation",
        });
      }
    }),

  createOrganization: adminProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUserMember = await ctx.db.query.member.findFirst({
        where: (member, { eq }) => eq(member.userId, ctx.session.user.id),
      });

      if (currentUserMember?.role !== "admin" && currentUserMember?.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create organizations",
        });
      }

      const org = await auth.api.createOrganization({
        body: {
          name: input.name,
          slug: input.slug,
        },
        headers: ctx.headers,
      });

      return org;
    }),

  // not sure if this can be public... I think it's fine since we are just verifying the token in db
  verifyTokenAndReturnUserEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const identifier = `reset-password:${input.token}`;

      const verification = await ctx.db.query.verification.findFirst({
        where: (verification, { eq }) => eq(verification.identifier, identifier),
      });

      // check if the verification entry exists and isn't expired
      if (!verification || verification.expiresAt < new Date()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired token",
        });
      }

      const account = await ctx.db.query.account.findFirst({
        where: (account, { eq }) => eq(account.accountId, verification.value),
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No account found for this token",
        });
      }

      const user = await ctx.db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, account.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found for this token",
        });
      }

      return user.email;
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await auth.api.resetPassword({
        body: {
          token: input.token,
          newPassword: input.newPassword,
        },
      });
    }),
});
