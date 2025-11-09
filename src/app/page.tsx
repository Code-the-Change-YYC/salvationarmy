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
import { HydrateClient, api } from "@/trpc/server";
import styles from "./index.module.css";

export default async function Home() {
  const hello = await api.form.hello({ text: "from tRPC" });
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    void api.form.getLatest.prefetch();
  }

  //--google maps link integration code (SANC-39)--
  const locationName = "1600 Amphitheatre Parkway, Mountain View, CA"; //NOTE: Grab from DB?
  /*
  //Call the google maps API to get the placeID for locationName
  const googleMapsAPIResponse = await fetch(`
    https://maps.googleapis.com/maps/api/place/findplacefromtext/json?
    input=${encodeURIComponent(locationName)}&
    inputtype=textquery&
    fields=place_id&
    key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );

  //Get the JSON object from the above fetch
  const googleMapsJSONObject = await googleMapsAPIResponse.json();
  console.log(googleMapsJSONObject);//
  if (googleMapsJSONObject.status == "OK"){

  } else{
    const placeID = googleMapsJSONObject.candidates[0].place_id; //place_id is stored as a nested JSON inside candidates
  }
  

  //Craft the google maps link
  //const googleMapsLink = `https://www.google.com/maps/place/?q=place_id:${placeID}`;
  */
  //-----------------------------------------------

  return (
    <HydrateClient>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Create <span className={styles.pinkSpan}>T3</span> App
          </h1>
          <div className={styles.cardRow}>
            <Link
              className={styles.card}
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className={styles.cardTitle}>First Steps →</h3>
              <div className={styles.cardText}>
                Just the basics - Everything you need to know to set up your database and
                authentication.
              </div>
            </Link>
            <Link
              className={styles.card}
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className={styles.cardTitle}>Documentation →</h3>
              <div className={styles.cardText}>
                Learn more about Create T3 App, the libraries it uses, and how to deploy it.
              </div>
            </Link>
          </div>
          <div className={styles.showcaseContainer}>
            <p className={styles.showcaseText}>
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className={styles.authContainer}>
              <p className={styles.showcaseText}>
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className={styles.loginButton}
              >
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
        <div id="SANC_39_GOOGLE_MAPS_LINK_INTEGRATION_CODE">
          <a href={locationName} target="_blank" rel="noreferrer">
            View in Google Maps
          </a>
        </div>
      </main>
    </HydrateClient>
  );
}
