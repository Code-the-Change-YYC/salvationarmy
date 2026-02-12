import { bookingsRouter } from "@/server/api/routers/bookings";
import { formRouter } from "@/server/api/routers/form";
import { organizationRouter } from "@/server/api/routers/organizations";
import { surveysRouter } from "@/server/api/routers/surveys";
import { tripRouter } from "@/server/api/routers/trip";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  form: formRouter,
  trip: tripRouter,
  organization: organizationRouter,
  bookings: bookingsRouter,
  surveys: surveysRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
