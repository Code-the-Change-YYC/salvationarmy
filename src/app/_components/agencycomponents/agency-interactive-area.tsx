"use client";

import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
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

  //Run the following every time inputElement.current gets a new value (occurs whenever destinationAddress field changes in mantine form)
  // biome-ignore lint: inputElement.current does change and needs to be changed in order for useEffect() to run
  useEffect(() => {
    //Do not run the code within the useEffect if the api or mantine form hasn't fully loaded
    if (
      googleScriptLoaded === false ||
      google.maps.places === null ||
      inputElement.current === null
    ) {
      return;
    }

    //Make the google auto complete element and attach it to inputElement (requires an HTML input element to mount to)
    const googleAutoCompleteElement = new google.maps.places.Autocomplete(inputElement.current, {
      types: ["address"],
    });

    //Places bounds on what locations google will suggest
    googleAutoCompleteElement.setComponentRestrictions({
      country: ["ca"], //Only show places in Canada
    });

    //Specifies which values we want to grab when the user makes an API call
    googleAutoCompleteElement.setFields(["geometry"]);

    //Attaches an event listener whenever the element's field changes
    googleAutoCompleteElement.addListener("place_changed", () => {
      const value = googleAutoCompleteElement.getPlace(); //Gets the value the user inputted

      if (value.geometry) {
        //The value is one of google's suggested locations. Geometry field is set if picked location is valid
        setValidationAddressGood(true);
      } else {
        //Google maps api could not figure out what the user gave it
        setValidationAddressGood(false);
      }
    });

    //Adds an event to inputElement.current (now that it's not null)
    function inputElementOnInput() {
      setValidationAddressGood(false); //User started typing, assume input is invalid
    }
    inputElement.current.addEventListener("input", inputElementOnInput);

    //When inputElement.current changes, remove the listeners from old elements to prevent any performance issues
    return () => {
      google.maps.event.clearInstanceListeners(googleAutoCompleteElement); //Removes the place_changed event listener to the old element
      inputElement.current?.removeEventListener("input", inputElementOnInput); //Removes the listener defined as inputElementOnInput from inputElement.current before replacing it
    };
  }, [inputElement.current]);

  const handleConfirm = async () => {
    setLoading(true);

    const validation = form.validate();

    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      setLoading(false);
      return;
    }

    const values = form.values;
    console.log("submit", values);

    // enter an actual api call here like a tanstack mutation
    // when calling the backend to verify form and update the db, must manually pass the destination address
    // do NOT use the mantine field form as it will not contain the destination address
    // use instead -> [inputElement.current?.value || ""]
    // see the below code for a sample usage of calling the backend to verify destination address
    /*
      //Define backend endpoint (if you need to directly call this api - probably won't though, put at the top of the file, under useStates)
      const validateDestinationAddressAPI = api.form.validateDestinationAddress.useMutation();

      if (validationAddressGood) {
        //Call the backend
        const result = await validateDestinationAddressAPI.mutateAsync({
          regionCode: "ca",
          destinationAddress: [inputElement.current?.value || ""],
        });

        //Evaluate the result from the back-end
        if (result === false) {
          //Manually adds an error field to the mantine form
          form.setFieldError("destinationAddress", "Destination address is too vague");
        } else{
          // use -> result passed from funct call as address that goes into db
          // update db with result var
          console.log("Backend is happy with input");
        }
      }
    */

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
