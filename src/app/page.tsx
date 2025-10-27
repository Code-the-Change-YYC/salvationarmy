import { headers } from "next/headers";
import Link from "next/link";

import AgGridTest from "@/app/_components/aggridtest";
import FullCalendarTest from "@/app/_components/fullcalendartest";
import MantineTest from "@/app/_components/mantinetest";
import { LatestForm } from "@/app/_components/testform";
import { auth } from "@/lib/auth";
import { HydrateClient, api } from "@/trpc/server";
import { Box } from "@mantine/core";
import CalendarView from "./_components/calendar-view";

export default async function Home() {
  const hello = await api.form.hello({ text: "from tRPC" });
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    void api.form.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main>
        <Box mx="auto" p="4rem">
          <div>
            <div>
              <p>{hello ? hello.greeting : "Loading tRPC query..."}</p>

              <div>
                <p>{session && <span>Logged in as {session.user?.name}</span>}</p>
                <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
                  {session ? "Sign out" : "Sign in"}
                </Link>
              </div>
            </div>

            {session?.user && <LatestForm />}
          </div>

          <CalendarView />

          <div>
            <h1>ag grid test</h1>
            <AgGridTest />
          </div>
          <div>
            <h1>full calendar test</h1>
            <FullCalendarTest />
          </div>
          <div>
            <h1>mantine test</h1>
            <MantineTest />
          </div>
        </Box>
      </main>
    </HydrateClient>
  );
}
