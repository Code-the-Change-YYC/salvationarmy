"use client";

import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { ViewMode } from "@/types/types";
import { Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState, useEffect } from "react";
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

  //Define backend endpoint
  const validateDestinationAddressAPI = api.form.validateDestinationAddress.useMutation();

  //Run the following once
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
        value.trim().length > 0 ? null : "Destination address is required",
    },
  });

  const handleConfirm = async () => {
    setLoading(true);

    //temp
    const result = await validateDestinationAddressAPI.mutateAsync({
      regionCode: "US",
      destinationAddress: ["1600 Amphitheatre Pkwy", "Mountain View, CA, 94043"],
    });
    console.log(result);

    /*
    const validation = form.validate();

    //Validate destination address using Google maps API
    const { AddressValidation } = (await google.maps.importLibrary(
      "addressValidation",
    )) as google.maps.AddressValidationLibrary; //Import Google map's Address Validation library. Assert the type to be from google.maps.AddressValidationLibrary
    //Call API to validate the destinationAddress
    const result = await AddressValidation.fetchAddressValidation({
      address: {
        regionCode: "US", //Temp region code
        addressLines: [form.values.destinationAddress], //Send the destinationAddress value to check
      },
    });
    //Evaluate result
    if (
      result.verdict.addressComplete === false ||
      result.verdict.hasUnconfirmedComponents === true
    ) {
      //Address is not proper enough to accept
      //Manually adds an error field to the mantine form
      form.setFieldError("destinationAddress", "Destination address is invalid");
      console.log("Given destination address is invalid");
    } else {
      console.log("Given destination address is valid");
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
        <AgencyForm form={form} />
      </Modal>
    </>
  );
};
