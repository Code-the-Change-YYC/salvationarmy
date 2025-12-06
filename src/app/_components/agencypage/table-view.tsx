"use client";
import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";
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
} from "@/constants/TableScheduleConstants";
import type { ScheduleInformation } from "@/types/types";
import styles from "./table-view.module.scss";

// register community modules for ag grid
ModuleRegistry.registerModules([AllCommunityModule]);

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
      <span>{headerName}</span>
    </div>
  );
};

// Format date to "Sept 12, 2025" format
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  // Handle both ISO date strings and date-only strings (YYYY-MM-DD)
  const date = dateString.includes("T") ? new Date(dateString) : new Date(dateString + "T00:00:00");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Format time to "12:00 PM" format
const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return "";
  // If it's already in HH:MM format, convert it
  if (timeString.includes(":")) {
    const parts = timeString.split(":");
    const hours = parts[0];
    const minutes = parts[1];
    if (!hours || !minutes) return timeString;
    const hour = parseInt(hours, 10);
    if (Number.isNaN(hour)) return timeString;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes.padStart(2, "0")} ${ampm}`;
  }
  return timeString;
};

export default function TableView() {
  // Dummy data for now. Will be replaced with actual bookings data.
  const [rowData] = useState<ScheduleInformation[]>(
    Array.from({ length: 15 }, () => ({
      CREATED_AT: "2025-09-12T10:00:00Z",
      CLIENT_NAME: "Jason Thompson",
      TELEPHONE: "403-123-4567",
      DATE_BOOKED: "2025-09-26",
      TIME_BOOKED: "12:00",
      AGENCY: "Amazing Agency",
      LOCATION: "123 Something St NW",
    })),
  );

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        ...createColumnDef(COLUMN_IDS.CREATED_AT),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => formatDate(params.value as string | undefined),
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
        valueFormatter: (params) => formatDate(params.value as string | undefined),
      },
      {
        ...createColumnDef(COLUMN_IDS.TIME_BOOKED),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => formatTime(params.value as string | undefined),
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
    resizable: true,
    sortable: true,
    filter: true,
  };

  return (
    <div className={`ag-theme-quartz ${styles.tableContainer}`}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        pagination={false}
      />
    </div>
  );
}
