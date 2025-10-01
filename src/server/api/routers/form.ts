import { eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { forms } from "@/server/db/schema";

export const formRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(forms).values({
				title: input.title,
				description: input.description,
				submittedById: ctx.session.user.id,
			});
		}),

	getLatest: protectedProcedure.query(async ({ ctx }) => {
		const form = await ctx.db.query.forms.findFirst({
			orderBy: (forms, { desc }) => [desc(forms.createdAt)],
		});

		return form ?? null;
	}),

	getAll: protectedProcedure.query(async ({ ctx }) => {
		const formList = await ctx.db.query.forms.findMany({
			orderBy: (forms, { desc }) => [desc(forms.createdAt)],
			with: {
				submittedBy: {
					columns: {
						name: true,
						email: true,
					},
				},
			},
		});

		return formList;
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const form = await ctx.db.query.forms.findFirst({
				where: (forms, { eq }) => eq(forms.id, input.id),
				with: {
					submittedBy: {
						columns: {
							name: true,
							email: true,
						},
					},
				},
			});

			return form ?? null;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Only update fields that are provided
			const fieldsToUpdate = Object.fromEntries(
				Object.entries(updateData).filter(([_, value]) => value !== undefined),
			);

			if (Object.keys(fieldsToUpdate).length === 0) {
				throw new Error("No fields provided to update");
			}

			await ctx.db.update(forms).set(fieldsToUpdate).where(eq(forms.id, id));
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(forms).where(eq(forms.id, input.id));
		}),

	getMyForms: protectedProcedure.query(async ({ ctx }) => {
		const myForms = await ctx.db.query.forms.findMany({
			where: (forms, { eq }) => eq(forms.submittedById, ctx.session.user.id),
			orderBy: (forms, { desc }) => [desc(forms.createdAt)],
		});

		return myForms;
	}),

	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),
});
