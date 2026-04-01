import { TRPCError } from "@trpc/server";
import { generateId } from "better-auth";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { vehicles } from "@/server/db/vehicles-schema";

export const vehiclesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.active, true))
      .orderBy(asc(vehicles.name));
  }),

  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(vehicles).orderBy(asc(vehicles.name));
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Vehicle name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const name = input.name.trim();
      const existingVehicle = await ctx.db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(eq(vehicles.name, name))
        .limit(1);

      if (existingVehicle.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That vehicle already exists.",
        });
      }

      const id = generateId();
      await ctx.db.insert(vehicles).values({
        id,
        name,
        active: true,
      });
      return { id, name, active: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Vehicle name is required"),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const name = input.name.trim();
      const existingVehicle = await ctx.db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(eq(vehicles.name, name))
        .limit(1);

      if (existingVehicle.length > 0 && existingVehicle[0]?.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That vehicle already exists.",
        });
      }

      await ctx.db
        .update(vehicles)
        .set({
          name,
          active: input.active,
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, input.id));

      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.update(vehicles).set({ active: false }).where(eq(vehicles.id, input.id));
    return { success: true };
  }),
});
