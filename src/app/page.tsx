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
  const locationName = "1600 Amphitheatre Parkway, Mountain View, CA"; //NOTE: Grab from DB or form displayed to user
  const formattedGoogleMapsURL = `https://maps.google.com/search?query=${encodeURIComponent(locationName)}`;
  //------------------------------------------------

  //--SANC-39 GOOGLE MAPS LINK INTEGRATION BUT BETTER--
  /*
  //----Place the following in the main driver page----
  //Will need to change how the script is loaded once actually added to the correct file (useEffect + teardown when it unmounts)
  const googleScript = document.createElement("script");
  googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`;
  googleScript.async = true; //Must wait for a promise before the script can be utilized properly
  document.body.appendChild(googleScript); //Add the script to the HTML body
  //---------------------------------------------------

  //----Delete when integrating----
  while (google === null || google.maps === null || google.maps.places === null){
    //Scuffed while loop to wait until the entire library loads
  }
  //-------------------------------

  //----Place the following in the part of the code that shows location details for the driver----
  const locationName = "1600 Amphitheatre Parkway, Mountain View, CA"; //NOTE: Grab from DB or form displayed to user

  let formattedGoogleMapsURL = "";

  const getPlaceIDInstance = new google.maps.places.AutocompleteService();
  getPlaceIDInstance.getPlacePredictions({
    input: locationName //Param 1: Need a location name to get the place ID of
  }, (predictedLocationsArray, statusOfPrediction) => { //Param 2: Give me a call-back function once the API is done predicting
    if (statusOfPrediction === google.maps.places.PlacesServiceStatus.OK && predictedLocationsArray){//API was able to get a prediction
      //Craft the URL
      formattedGoogleMapsURL = `https://www.google.com/maps/place/?q=place_id:${predictedLocationsArray[0]?.place_id || ""}`;
    } else{//API could not get a prediction
      console.log("ERROR: Could not find placeID of destination address")
    }
  });
  */
  //---------------------------------------------------

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
          <a href={formattedGoogleMapsURL} target="_blank" rel="noreferrer">
            View in Google Maps
          </a>
        </div>
      </main>
    </HydrateClient>
  );
}
