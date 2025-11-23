import { Box } from "@mantine/core";
import { headers } from "next/headers";
import Link from "next/link";
import AgGridTest from "@/app/_components/aggridtest";
import ModalTests from "@/app/_components/common/modal/modaltests";
import FullCalendarTest from "@/app/_components/fullcalendartest";
import MantineTest from "@/app/_components/mantinetest";
import SegmentedControlTest from "@/app/_components/segmentedControlTest";
import { LatestForm } from "@/app/_components/testform";
import { TestNotificationButton } from "@/app/_components/testnotificationbutton";
import { auth } from "@/lib/auth";
import { api, HydrateClient } from "@/trpc/server";

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

          <div>
            <h1>Go to agency page</h1>
            <Link href="/agency/home">Agency Home Page</Link>
            <h1>Go to admin page (there is auth here)</h1>
            <Link href="/admin/home">Admin Home Page</Link>
            <h1>Go to drivers page (there is auth here)</h1>
            <Link href="/driver/home">Drivers Home Page</Link>
            <h1>Go to button style guide</h1>
            <Link href="/style-guide">Button Style Guide</Link>
            <h1>Sign up with test user</h1>
          </div>
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
          <div>
            <h1>Segmented Control Test</h1>
            <SegmentedControlTest />
          </div>

          <div>
            <h1>Mantine notifications test</h1>
            <TestNotificationButton />
          </div>
          <div>
            <h1>Modal Tests</h1>
            <ModalTests />
          </div>
        </Box>
      </main>
    </HydrateClient>
  );
}
