"use client";

import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { ViewMode } from "@/types/types";
import { Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState, useEffect, useRef } from "react";
import styles from "./agency-interactive-area.module.scss";

interface Props {
  initialViewMode?: ViewMode;
}

export const AgencyInteractiveArea = ({ initialViewMode = ViewMode.CALENDAR }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  // eventually this loading state will be replacted with a tanstack mutation loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [googleScriptLoaded, setInitialLoad] = useState<boolean>(false); //Initially, the script has not loaded
  const [validationAddressGood, setValidationAddressGood] = useState<boolean>(false);
  const [googleAutocompleteLoaded, setAutocompleteLoaded] = useState<boolean>(false); //Used only because google's auto complete library takes too long to load

  //Define backend endpoint
  const validateDestinationAddressAPI = api.form.validateDestinationAddress.useMutation();

  //Define a variable that react will reassign its value on runtime
  //Starts off as null but will equal (through inputElement.current) an HTML input element when assigned at runtime
  //Will be assigned an HTML input element when the mantine form loads
  const inputElement = useRef<HTMLInputElement | null>(null);

  //Run the following once, after react renders everything
  useEffect(() => {
    //Create an HTML script element so that the google maps API is loaded at runtime (needed for billing reasons among others)
    const googleScript = document.createElement("script");
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`;
    googleScript.async = true; //Must wait for a promise before the script can be utilized properly
    googleScript.onload = async () => {
      //When the script is loaded, refresh the react DOM
      setInitialLoad(true); //Changes the state, causing a refresh
    };
    document.body.appendChild(googleScript); //Add the script to the HTML body

    //Cleanup: When this component is unmounted, remove the script tag to keep things clean
    return () => {
      document.body.removeChild(googleScript);
    };
  }, []);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      residentName: "",
      contactInfo: "",
      additionalInfo: "",
      transportDateTime: "",
      purpose: "",
      destinationAddress: "",
    },

    validate: {
      residentName: (value) => (value.trim().length > 0 ? null : "Resident name is required"),
      contactInfo: (value) => (value.trim().length > 0 ? null : "Contact info is required"),
      transportDateTime: (value) => (value.trim().length > 0 ? null : "Date and time is required"),
      purpose: (value) => (value.trim().length > 0 ? null : "Purpose is required"),
      destinationAddress: (value) =>
        value.trim().length > 0
          ? validationAddressGood
            ? null
            : "Destination address is invalid"
          : "Destination address is required",
    },
  });

  //Run the following once, after the google maps places api has loaded
  if (
    googleScriptLoaded === true &&
    google.maps.places &&
    googleAutocompleteLoaded === false &&
    inputElement.current !== null
  ) {
    //Make the google auto complete element and attach it to inputElement (requires an HTML input element to mount to)
    const googleAutoCompleteElement = new google.maps.places.Autocomplete(inputElement.current, {
      types: ["geocode"], //Ensures that the list of suggested addresses are addresses and not businesses
    });

    //Specifies which values we want to grab when the user makes an API call
    googleAutoCompleteElement.setFields(["formatted_address", "geometry"]);

    //Attaches an event listener whenever the element's field changes
    googleAutoCompleteElement.addListener("place_changed", () => {
      const value = googleAutoCompleteElement.getPlace(); //Gets the value the user inputted

      if (value.geometry) {
        //The value is one of google's suggested locations. Geometry field is set if picked location is valid
        form.setFieldValue(
          "destinationAddress",
          value.formatted_address || inputElement.current?.value || "",
        ); //The || exists in case address is valid but google cannot make a formatted address for it (happens sometimes)
        setValidationAddressGood(true);
      } else {
        //Google maps api could not figure out what the user gave it
        setValidationAddressGood(false);
      }
    });

    //Adds an event to inputElement.current (now that it's not null)
    inputElement.current.addEventListener("input", () => {
      setValidationAddressGood(false); //User started typing, assume input is invalid
    });

    setAutocompleteLoaded(true); //Sets this variable true so this function never runs again
  }

  const handleConfirm = async () => {
    setLoading(true);

    const validation = form.validate();

    if (validationAddressGood) {
      //Destination address passes front-end checks
      //Call the backend
      //---TEMP RIGHT NOW VV
      const result = await validateDestinationAddressAPI.mutateAsync({
        regionCode: "US",
        destinationAddress: ["1600 Amphitheatre Pkwy", "Mountain View, CA, 94043"],
      });
      console.log(result);
      //----END OF TEMP CODE

      //Evaluate the result from the back-end
      if (result === false) {
        //Manually adds an error field to the mantine form
        form.setFieldError("destinationAddress", "Destination address is invalid");
      }
    }

    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      setLoading(false);
      return;
    }

    const values = form.values;
    console.log("submit", values);

    // enter an actual api call here like a tanstack mutation

    setTimeout(() => {
      setLoading(false);
      setShowBookingModal(false);
      notify.success("Booking successfully created");
      form.reset();
    }, 2000);
  };

  //The google maps API script has not loaded yet
  if (!googleScriptLoaded) {
    return <></>; //Return nothing. Wait for the script to load, where it'll refresh the DOM
  }

  return (
    <>
      <ViewController
        setShowBookingModal={setShowBookingModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className={styles.calendarContainer}>
        {viewMode === ViewMode.CALENDAR ? (
          <div>calendar will be here</div>
        ) : (
          <div>ag grid table will be here</div>
        )}
      </div>

      <Modal
        opened={showBookingModal}
        onClose={() => {
          form.clearErrors();
          setShowBookingModal(false);
        }}
        onConfirm={() => {
          handleConfirm();
        }}
        title={
          <Title order={3} size="h3">
            Add a booking
          </Title>
        }
        size="xl"
        showDefaultFooter
        confirmText="Confirm Booking"
        loading={loading}
      >
        <AgencyForm form={form} destinationAddressRef={inputElement} />
      </Modal>
    </>
  );
};
