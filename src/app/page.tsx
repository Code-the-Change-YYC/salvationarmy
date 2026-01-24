import { Box } from "@mantine/core";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
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
  googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`;
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
      <main>
        <Box mx="auto" p="4rem">
          <div>
            <h1>Go to login page</h1>
            <Link href="/login">Login Page</Link>
            <h1>Go to agency page</h1>
            <Link href="/agency/home">Agency Home Page</Link>
            <h1>Go to admin page (there is auth here)</h1>
            <Link href="/admin/schedule">Admin Home Page</Link>
            <h1>Go to drivers page (there is auth here)</h1>
            <Link href="/driver/home">Drivers Home Page</Link>
            <h1>Go to button style guide</h1>
            <Link href="/style-guide">Button Style Guide</Link>
          </div>
          <div id="SANC_39_GOOGLE_MAPS_LINK_INTEGRATION_CODE">
            <a href={formattedGoogleMapsURL} target="_blank" rel="noreferrer">
              View in Google Maps
            </a>
          </div>
        </Box>
      </main>
    </HydrateClient>
  );
}
