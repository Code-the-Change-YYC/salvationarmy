# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

- [Next.js](https://nextjs.org)
- [BetterAuth](https://www.better-auth.com/docs/introduction)
- [Drizzle](https://orm.drizzle.team)
- [SASS](https://sass-lang.com/)
- [tRPC](https://trpc.io)

## Seeding the db

First install bun:

```bash
npm install -g bun
```

Then run the script:

```bash
npm run seed
# or
yarn seed
# or
pnpm run seed
```

## TRPC vs. REST APIs

Why even use tRPC?

Since we are using typescript it's nice to have typesense on everything so you don't make dumb mistakes.

tRPC lets you call backend functions directly from your frontend as if they were local functions, with full TypeScript type safety.

This means you don't actually have to write REST endpoints or manual API routes:

```typescript
// backend: app/api/users/route.ts
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}

// frontend: You make a fetch request
const response = await fetch("/api/users");
const users = await response.json(); // there's no type safety here
```

Instead, with tRPC we know what exactly is going to be returned even from the frontend:

```typescript
// backend: server/api/routers/user.ts
export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany();
  }),
});

// frontend: You call it like a function
const { data: users } = trpc.user.getAll.useQuery();
// typescript knows the exact type of the user
```

However, note that we still need API endpoints for things like:

- webhooks
- public APIs to fetch data from
- file uploads (even though tRPC can handle them, it's easier defining a normal API route)

## Where TF are my query keys?

TanStack Query manages server state like fetching, caching, synchronizing, and updating data from APIs so you don't have to write all the loading states, error handling, and cache invalidation logic yourself.

For those who have worked with Tanstack Query you might be wondering where and how tRPC is integrated into Tanstack. You can view some of the config files in the `trpc` folder.

tRPC is built upon Tanstack Query. This means that we can use their built in utils to invalidate or get query data.

```typescript
const utils = trpc.useUtils();

// Invalidate all user queries
utils.user.invalidate();

// Invalidate specific query
utils.user.getById.invalidate({ id: "123" });

// Prefetch
await utils.user.getAll.prefetch();

// Set query data
utils.user.getById.setData({ id: "123" }, newUserData);

// Get query data
const userData = utils.user.getById.getData({ id: "123" });
```

We can even get and view tanstack query keys if needed for prefetch operations:

```typescript
import { getQueryKey } from "@trpc/react-query";

// Get the query key
const queryKey = getQueryKey(trpc.user.getById, { id: "123" });

// Invalidate
queryClient.invalidateQueries({ queryKey });

// Prefetch
await queryClient.prefetchQuery({
  queryKey,
  queryFn: () => trpc.user.getById.fetch({ id: "123" }),
});

// Set data manually
queryClient.setQueryData(queryKey, newUserData);
```

## Drizzle and databases, environment variables

This project uses drizzle for DB migrations and schema managment, rather than writing raw SQL and doing manual migrations to Supabase

We are able to:

- define our schema in TS so it's readable and resuable
- automatically generate migrations when this schema changes
- sync these migrations with our db

To generate the schema required by Better Auth, run the following command:

```bash
npx @better-auth/cli@latest generate
```

### Difference between environments

| Environment | Purpose                                        | Database                      | Env File     |
| ----------- | ---------------------------------------------- | ----------------------------- | ------------ |
| **Local**   | Each dev’s personal Supabase project           | Supabase (personal instance)  | `.env.local` |
| **Dev**     | Shared dev environment for integration testing | Supabase (team project)       | `.env.dev`   |
| **Prod**    | Production database for real data              | Supabase (production project) | `.env.prod`  |

### Commands you should know

| Command    | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `generate` | Generate a new migration file when schema changes                |
| `migrate`  | Apply all pending migrations to the selected database            |
| `push`     | Force sync schema with the database (used **only locally**)      |
| `drop`     | Delete all tables in the target database (used **only locally**) |

### The typical workflow if working on a feature

There are three workflows when working on a feature that involves changing the schema:

- Locally testing

```bash
# 1. Make schema changes in src/db/schema.ts
# 2. Generate migration
yarn db:generate

# 3. Apply migration to your personal Supabase database
yarn db:migrate

# 4. Run your app and test new DB features locally
```

You can use `yarn db:push:local` for quick testing of schema changes against your personal Supabase project because it directly syncs your schema to your local DB without generating migrations.

However:

- Never use push on shared dev or prod databases.
- Always finalize your schema and then run:

```bash
yarn db:generate
yarn db:migrate
```

before committing, so migrations stay in version control.

Never run push or drop on the shared dev or prod databases because **those commands can delete or overwrite data.**

- After the merge to main, we have to add these changes made in the feature branch to dev

```bash
git pull
yarn db:migrate
```

- Deploying confirmed changes to prod

```bash
# only after these changes have been verified to be good
yarn db:migrate
```

## Initializing an Admin Account

Before running the seed script, ensure the following setup is complete:

- Bun installed and available in your terminal
- Local Supabase instance running
- Database migrations have been applied. Run:

```bash
yarn db:migrate
```

Once your database schema is up to date, run the seed script to create a default administrator user:

```bash
yarn seed
```

After running the script, the terminal will output a generated admin email and password.
Use these credentials on the `/login` page to sign in.

Once logged in, the session persists across the app, allowing you to test authentication, protected routes, and role-based access during development.

## Other seeding documentation

# Seeding Script Documentation

This seeding script helps you populate your database with test data for development.

## Quick Start

```bash
# First time setup - creates all users, organizations, and bookings
bun seed

# Or run specific parts:
bun seed --users       # Only create users and organizations
bun seed --bookings    # Only create bookings (requires users to exist)
bun seed --bookings --clear  # Clear existing bookings and create new ones
```

## What Gets Created

### Users & Organizations (--users flag)

**Admin User:**

- Email: `admin@salvationarmy.com` (or from `ADMIN_EMAIL` env var)
- Password: `Password123!` (or from `ADMIN_PASSWORD` env var)
- Role: `admin`
- Organization: Member of all organizations as `owner`

**Organizations:**

1. Admins (`admins`)
2. Drivers (`drivers`)
3. Agency One (`agency-one`)
4. Agency Two (`agency-two`)
5. Agency Three (`agency-three`)

**Driver User:**

- Email: `driver@salvationarmy.com`
- Password: `Password123!`
- Role: `driver`
- Organization: Drivers organization as `member`

**Agency Users:**

1. Email: `agency-one@salvationarmy.com`
   - Role: `agency`
   - Organization: Agency One as `member`

2. Email: `agency-two@salvationarmy.com`
   - Role: `agency`
   - Organization: Agency Two as `member`

3. Email: `agency-three@salvationarmy.com`
   - Role: `agency`
   - Organization: Agency Three as `member`

Password for all agency users: `Password123!`

### Bookings (--bookings flag)

Creates ~18 test bookings distributed across the three agencies, all assigned to the driver user:

**Time Distribution:**

- **25% Past** (1-7 days ago): Status is either `completed` or `cancelled`
- **50% Today/Tomorrow**: Status is either `incomplete` or `in-progress`
- **25% Future** (2-8 days ahead): Status is `incomplete`

**Booking Details:**

- All bookings are assigned to the driver user
- Created by the respective agency users
- Realistic Calgary addresses and purposes
- Random phone numbers
- 1-hour duration slots
- Survey completion status varies for completed bookings

## Command Line Flags

- `--users` - Create users and organizations
- `--bookings` - Create bookings
- `--clear` - Clear existing bookings before creating new ones (only works with `--bookings`)
- No flags - Runs both `--users` and `--bookings`

## Usage Examples

```bash
# Initial setup - create everything
yarn seed

# Just create users and organizations (first time)
yarn seed --users

# Add bookings to existing users
yarn seed --bookings

# Clear all bookings and create fresh ones (useful for testing)
yarn seed --bookings --clear

# Recreate everything from scratch
yarn seed --users --bookings --clear
```

## Environment Variables

You can customize the admin user credentials via environment variables:

```bash
ADMIN_EMAIL=custom@email.com
ADMIN_PASSWORD=CustomPassword123!
ADMIN_NAME="Custom Admin Name"
```

If not provided, defaults to:

- Email: `admin@salvationarmy.com`
- Password: `Password123!`
- Name: `Admin User`

## Important Notes

⚠️ **Production Warning**: Remember to change all default passwords before deploying to production!

⚠️ **Dependencies**: The `--bookings` flag requires users to exist first. If you get an error about missing users, run with `--users` flag first.

⚠️ **Idempotent**: Running `--users` multiple times is safe - it won't create duplicates. Running `--bookings` without `--clear` will add more bookings.

## Workflow Recommendations

**For Development:**

1. Initial setup: `bun seed` (creates users + bookings)
2. When you want fresh bookings: `bun seed --bookings --clear`
3. When testing with different data: `bun seed --bookings` (appends new bookings)

**For Testing:**

- Use `--clear` flag frequently to ensure clean state
- Create users once, recreate bookings as needed

## Troubleshooting

**"Driver not found" error:**

- Solution: Run `bun seed --users` first

**"No agency users found" error:**

- Solution: Run `bun seed --users` first

**Users already exist:**

- This is normal - the script checks for existing users and skips creation

**Want to reset everything:**

```bash
# Manually clear database tables, then:
yarn seed
```

## Enabling typesense for SCSS modules

I've added a plugin `typescript-plugin-css-modules` but you also might have to follow this tutorial [here](https://www.npmjs.com/package/typescript-plugin-css-modules#visual-studio-code) and add it to your VSCode settings.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
