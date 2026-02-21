"use client";

import { Alert, Box, Loader, Paper, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { type Libraries, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import CalendarView from "@/app/_components/common/calendar/calendar-view";
import Modal from "@/app/_components/common/modal/modal";
import { env } from "@/env";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { type Booking, type CalendarUserView, ViewMode } from "@/types/types";
import { validateStringLength, validateTimeRange } from "@/types/validation";
import TableView from "../agencypage/table-view";
import LoadingScreen from "../common/loadingscreen";
import styles from "./agency-interactive-area.module.scss";

type BookingModalMode = "create" | "edit";

interface Props {
  initialViewMode?: ViewMode;
  viewType?: CalendarUserView;
  modalMode?: BookingModalMode;
  booking?: Booking;
  onBookingChange?: () => void;
}

const GOOGLE_MAPS_LIBRARIES_ARRAY: Libraries = ["places"]; //Add more to this array if you need to import more libraries from the API
const CHERRY_RED = "#A03145";

export const BookingInteractiveArea = ({
  initialViewMode = ViewMode.CALENDAR,
  viewType,
  modalMode = "create",
  booking,
  onBookingChange,
}: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [currentModalMode, setCurrentModalMode] = useState<BookingModalMode>(modalMode);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(booking);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDayView, setIsDayView] = useState<boolean>(false);
  const [validationAddressGood, setValidationAddressGood] = useState<boolean>(false);

  const utils = api.useUtils();
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
  } = api.bookings.getAll.useQuery();
  const createBookingMutation = api.trip.create.useMutation({
    onSuccess: () => {
      notify.success("Booking successfully created");
      handleModalCleanup();
      void utils.bookings.getAll.invalidate();
      onBookingChange?.();
    },
    onError: (error) => {
      notify.error(error.message || "Failed to create a booking");
    },
  });

  const updateBookingMutation = api.bookings.update.useMutation({
    onSuccess: () => {
      notify.success("Booking successfully updated");
      handleModalCleanup();
      void utils.bookings.getAll.invalidate();
      onBookingChange?.();
    },
    onError: (error) => {
      notify.error(error.message || "Failed to update booking");
    },
  });

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
    initialValues: {
      title: "",
      residentName: "",
      phoneNumber: "",
      additionalInfo: "",
      startTime: "",
      endTime: "",
      purpose: "",
      pickupAddress: "",
      destinationAddress: "",
    },

    validate: {
      title: (value) => validateStringLength(value, 1, 150, "Booking name"),
      residentName: (value) => validateStringLength(value, 1, 100, "Resident name"),
      phoneNumber: (value) => validateStringLength(value, 1, 150, "Contact information"),
      additionalInfo: (value) => {
        // Optional field, only validate max length if provided
        if (value.trim().length === 0) return null;
        return validateStringLength(value, 0, 500, "Additional information");
      },
      startTime: (value) => {
        // First check if required
        if (value.trim().length === 0) return "Date and time is required";
        // Then validate date format
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Invalid date format";
        return null;
      },
      endTime: (value, values) => {
        // First check if required
        if (value.trim().length === 0) return "Date and time is required";
        // Then validate time range (this also validates date format)
        return validateTimeRange(values.startTime, value);
      },
      purpose: (value) => validateStringLength(value, 1, 500, "Purpose of transport"),
      pickupAddress: (value) => validateStringLength(value, 1, 300, "Pickup address"),
      destinationAddress: (value) => validateStringLength(value, 1, 300, "Destination address"),
    },
  });

  useEffect(() => {
    if (selectedBooking && currentModalMode === "edit") {
      let residentName = "";
      let phoneNumberFallback = "";
      let additionalInfo = "";

      if (selectedBooking.passengerInfo) {
        const parts = selectedBooking.passengerInfo.split("|");
        residentName = parts[0] || "";
        phoneNumberFallback = parts[1] || "";
        additionalInfo = parts[2] || "";
      }

      const phoneNumber = selectedBooking.phoneNumber?.trim()
        ? selectedBooking.phoneNumber
        : phoneNumberFallback;

      form.setValues({
        title: selectedBooking.title,
        residentName,
        phoneNumber,
        additionalInfo,
        startTime: new Date(selectedBooking.startTime).toISOString(),
        endTime: new Date(selectedBooking.endTime).toISOString(),
        purpose: selectedBooking.purpose || "",
        pickupAddress: selectedBooking.pickupAddress,
        destinationAddress: selectedBooking.destinationAddress,
      });

      setValidationAddressGood(true);
    }
  }, [selectedBooking, currentModalMode, form.setValues]);

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

  const handleConfirm = () => {
    const validation = form.validate();
    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    if (!validationAddressGood) {
      form.setFieldError("destinationAddress", "Please select a valid address from the dropdown");
      return;
    }

    const startDate = new Date(form.values.startTime);
    const endDate = new Date(form.values.endTime);

    if (Number.isNaN(startDate.getTime())) {
      form.setFieldError("startTime", "Invalid date format");
      return;
    }

    if (Number.isNaN(endDate.getTime())) {
      form.setFieldError("endTime", "Invalid date format");
      return;
    }

    if (currentModalMode === "create") {
      createBookingMutation.mutate({
        title: form.values.title,
        residentName: form.values.residentName,
        phoneNumber: form.values.phoneNumber,
        additionalInfo: form.values.additionalInfo,
        pickupAddress: form.values.pickupAddress,
        destinationAddress: inputElement.current?.value || "",
        startTime: form.values.startTime,
        endTime: form.values.endTime,
        purpose: form.values.purpose,
      });
    } else if (currentModalMode === "edit" && selectedBooking) {
      const passengerInfo = `${form.values.residentName}|${form.values.phoneNumber}|${form.values.additionalInfo}`;

      updateBookingMutation.mutate({
        id: selectedBooking.id,
        title: form.values.title,
        pickupAddress: form.values.pickupAddress,
        destinationAddress: inputElement.current?.value || "",
        purpose: form.values.purpose,
        passengerInfo,
        phoneNumber: form.values.phoneNumber,
        startTime: form.values.startTime,
        endTime: form.values.endTime,
      });
    }
  };

  const handleModalCleanup = () => {
    form.reset();
    setShowBookingModal(false);
    setValidationAddressGood(false);
    setSelectedBooking(undefined);
  };

  const handleOpenCreateModal = () => {
    setCurrentModalMode("create");
    setSelectedBooking(undefined);
    form.reset();
    setValidationAddressGood(false);
    setShowBookingModal(true);
  };

  const handleOpenEditModal = (booking: Booking) => {
    setCurrentModalMode("edit");
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    form.clearErrors();
    handleModalCleanup();
  };

  //If the script hasn't loaded yet, don't render anything until it does
  if (!isLoaded) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <>
      <ViewController
        setShowBookingModal={handleOpenCreateModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isDayView={isDayView}
      />

      <div className={styles.viewContainer}>
        {isLoadingBookings ? (
          <Box className={styles.loadingContainer}>
            <Loader color={CHERRY_RED} type="dots" />
          </Box>
        ) : isErrorBookings ? (
          <Box className={styles.errorContainer}>
            <Alert variant="light" color="red">
              Failed to load bookings. Please try again later.
            </Alert>
          </Box>
        ) : viewMode === ViewMode.CALENDAR ? (
          <CalendarView
            bookings={bookings ?? []}
            currentDate={currentDate}
            setIsDayView={setIsDayView}
            viewType={viewType}
            onEditBooking={handleOpenEditModal}
          />
        ) : (
          <TableView bookings={bookings ?? []} />
        )}
      </div>

      <Modal
        opened={showBookingModal}
        onClose={handleCloseModal}
        onConfirm={() => {
          handleConfirm();
        }}
        title={
          <Box fw={600} fz="xl">
            {currentModalMode === "create" ? "Add a booking" : "Edit booking"}
          </Box>
        }
        size="xl"
        showDefaultFooter
        confirmText={currentModalMode === "create" ? "Confirm Booking" : "Save Changes"}
        loading={createBookingMutation.isPending || updateBookingMutation.isPending}
      >
        <AgencyForm form={form} destinationAddressRef={inputElement} />
      </Modal>
    </>
  );
};
