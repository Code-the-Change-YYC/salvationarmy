"use client";
import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import Calendar from "@/assets/icons/calendar";
import Call from "@/assets/icons/call";
import Clock from "@/assets/icons/clock";
import Edit from "@/assets/icons/edit";
import Face from "@/assets/icons/face";
import Location from "@/assets/icons/location";
import {
  COLUMN_IDS,
  createColumnDef,
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  TABLE_THEME_PARAMS,
} from "@/constants/TableScheduleConstants";
import type { Booking, ScheduleInformation } from "@/types/types";
import styles from "./table-view.module.scss";

const HeaderWithIcon = (params: IHeaderParams) => {
  const columnId = params.column?.getColId();
  const headerName = params.displayName || "";

  const getIcon = () => {
    switch (columnId) {
      case COLUMN_IDS.CREATED_AT:
      case COLUMN_IDS.DATE_BOOKED:
        return <Calendar width="16px" height="16px" />;
      case COLUMN_IDS.CLIENT_NAME:
        return <Edit width="16px" height="16px" />;
      case COLUMN_IDS.TELEPHONE:
        return <Call width="16px" height="16px" />;
      case COLUMN_IDS.TIME_BOOKED:
        return <Clock width="16px" height="16px" />;
      case COLUMN_IDS.AGENCY:
        return <Face width="16px" height="16px" />;
      case COLUMN_IDS.LOCATION:
        return <Location width="16px" height="16px" />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.headerWithIcon}>
      {getIcon()}
      <span className={styles.headerName}>{headerName}</span>
    </div>
  );
};

interface TableViewProps {
  bookings: Booking[];
}

function transformBookingsToScheduleInfo(bookingsList: Booking[]): ScheduleInformation[] {
  return bookingsList.map((booking) => ({
    CREATED_AT: booking.createdAt?.toISOString() ?? "",
    CLIENT_NAME: booking.passengerInfo ? (booking.passengerInfo.split("|")[0] ?? null) : null,
    TELEPHONE: booking.phoneNumber ?? "-",
    DATE_BOOKED: booking.startTime,
    TIME_BOOKED: booking.startTime,
    AGENCY: booking.agencyId,
    LOCATION: booking.destinationAddress,
  }));
}

export default function TableView({ bookings }: TableViewProps) {
  // register community modules for ag grid
  useEffect(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);

  // Custom theme for the table
  const theme = themeQuartz.withParams(TABLE_THEME_PARAMS);

  const rowData = useMemo(() => transformBookingsToScheduleInfo(bookings ?? []), [bookings]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        ...createColumnDef(COLUMN_IDS.CREATED_AT),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => dayjs(params.value).format("MMM D, YYYY"),
      },
      {
        ...createColumnDef(COLUMN_IDS.CLIENT_NAME),
        headerComponent: HeaderWithIcon,
      },
      {
        ...createColumnDef(COLUMN_IDS.TELEPHONE),
        headerComponent: HeaderWithIcon,
      },
      {
        ...createColumnDef(COLUMN_IDS.DATE_BOOKED),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => dayjs(params.value).format("MMM D, YYYY"),
      },
      {
        ...createColumnDef(COLUMN_IDS.TIME_BOOKED),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => dayjs(params.value).format("h:mm A"),
      },
      {
        ...createColumnDef(COLUMN_IDS.AGENCY),
        headerComponent: HeaderWithIcon,
      },
      {
        ...createColumnDef(COLUMN_IDS.LOCATION),
        headerComponent: HeaderWithIcon,
      },
    ],
    [],
  );

  const defaultColDef: ColDef = {
    flex: 1,
    width: DEFAULT_COLUMN_WIDTH,
    minWidth: MIN_COLUMN_WIDTH,
    resizable: false,
    sortable: true,
    filter: true,
  };

  return (
    <div className={styles.tableContainer}>
      <AgGridReact
        theme={theme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={false}
      />
    </div>
  );
}
