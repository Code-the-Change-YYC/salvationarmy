"use client";

import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { type Libraries, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import Modal from "@/app/_components/common/modal/modal";
import { env } from "@/env";
import { notify } from "@/lib/notifications";
import { ViewMode } from "@/types/types";
import CalendarView from "../calendar-view";
import styles from "./agency-interactive-area.module.scss";

interface Props {
  initialViewMode?: ViewMode;
}

const GOOGLE_MAPS_LIBRARIES_ARRAY: Libraries = ["places"]; //Add more to this array if you need to import more libraries from the API

export const BookingInteractiveArea = ({ initialViewMode = ViewMode.CALENDAR }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  // eventually this loading state will be replacted with a tanstack mutation loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDayView, setIsDayView] = useState<boolean>(false);
  const [validationAddressGood, setValidationAddressGood] = useState<boolean>(false);

  //Define a variable that react will reassign its value on runtime
  //Starts off as null but will equal (through inputElement.current) an HTML input element when assigned at runtime
  //Will be assigned an HTML input element when the mantine form loads
  const inputElement = useRef<HTMLInputElement | null>(null);

  //Load the Google maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES_ARRAY, //Import the places library
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      residentName: "",
      contactInfo: "",
      additionalInfo: "",
      startTime: "",
      endTime: "",
      purpose: "",
      pickupAddress: "",
      destinationAddress: "",
    },

    validate: {
      title: (value) => (value.trim().length > 0 ? null : "Title is required"),
      residentName: (value) => (value.trim().length > 0 ? null : "Resident name is required"),
      contactInfo: (value) => (value.trim().length > 0 ? null : "Contact info is required"),
      startTime: (value) => (value.trim().length > 0 ? null : "Date and time is required"),
      endTime: (value) => (value.trim().length > 0 ? null : "Date and time is required"),
      purpose: (value) => (value.trim().length > 0 ? null : "Purpose is required"),
      pickupAddress: (value) => (value.trim().length > 0 ? null : "Pickup address is required"),
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
    if (!isLoaded || google.maps.places === null || inputElement.current === null) {
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
        if (result === null) {
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

  //If the script hasn't loaded yet, don't render anything until it does
  if (!isLoaded) {
    return <div></div>;
  }

  return (
    <>
      <ViewController
        setShowBookingModal={setShowBookingModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isDayView={isDayView}
      />

      <div className={styles.calendarContainer}>
        {viewMode === ViewMode.CALENDAR ? (
          <CalendarView currentDate={currentDate} setIsDayView={setIsDayView} />
        ) : (
          <div>ag grid table will be here</div>
        )}
      </div>

      <Modal
        opened={showBookingModal}
        onClose={() => {
          form.clearErrors();
          form.setFieldValue("destinationAddress", "");
          setShowBookingModal(false);
        }}
        onConfirm={() => {
          handleConfirm();
        }}
        title={
          <Box fw={600} fz="xl">
            Add a booking
          </Box>
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
