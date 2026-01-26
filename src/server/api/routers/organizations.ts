import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { user } from "@/server/db/auth-schema";
import { OrganizationRole, Role } from "@/types/types";
import { nameRegex, passwordSchema } from "@/types/validation";

export const organizationRouter = createTRPCRouter({
  redirectToDashboard: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found in database",
      });
    }

    const role = user.role as Role;
    let redirectUrl = "/";

    if (user.name === "") {
      redirectUrl = "/fill-out-name";
    } else {
      switch (role) {
        case Role.ADMIN:
          redirectUrl = "/admin/home";
          break;

        case Role.AGENCY: {
          const activeOrgId = ctx.session.session.activeOrganizationId;

          if (!activeOrgId) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message:
                "No active organization found for this agency user. Please contact an administrator for assistance",
            });
          }

          const organization = await ctx.db.query.organization.findFirst({
            where: (org, { eq }) => eq(org.id, activeOrgId),
          });

          if (!organization) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Organization not found",
            });
          }

          if (!organization.slug) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Organization is missing required slug configuration. Please contact an administrator for assistance",
            });
          }

          redirectUrl = `/agency/home/${organization.slug}`;
          break;
        }

        case Role.DRIVER:
          redirectUrl = "/driver/home";
          break;

        default:
          redirectUrl = "/";
          break;
      }
    }

    return {
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const organizations = await ctx.db.query.organization.findMany();

      return organizations;
    } catch (error) {
      throw new TRPCError({
        cause: error,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),

  getAllWithMembers: adminProcedure.query(async ({ ctx }) => {
    try {
      const organizations = await ctx.db.query.organization.findMany({
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
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
        organizationRole: z.nativeEnum(OrganizationRole),
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // hopefully this never happens but members should only be part of one org, so find first could change
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
            role: input.organizationRole,
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
        newPassword: passwordSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await auth.api.resetPassword({
        body: {
          token: input.token,
          newPassword: input.newPassword,
        },
      });
    }),

  sendPasswordResetEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await auth.api.requestPasswordReset({
          body: {
            email: input.email,
            redirectTo: "/reset-password",
          },
        });

        if (!response.status) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.message || "Failed to send reset email",
          });
        }

        return {
          success: true,
          email: input.email,
        };
      } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send password reset email",
        });
      }
    }),

  changeName: protectedProcedure
    .input(z.object({ newName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { newName } = input; //Get the passed variables

      if (!nameRegex.test(newName)) {
        //User inputted name is not proper
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Name",
        });
      }

      const listOfUpdatedUsers = await ctx.db
        .update(user)
        .set({ name: newName })
        .where(eq(user.id, ctx.session.user.id))
        .returning(); //Make DB update command to change the user's name

      if (listOfUpdatedUsers.length === 0) {
        //Drizzle updated no users (something went wrong)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user's name",
        });
      }
    }),
});
