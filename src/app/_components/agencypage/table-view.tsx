"use client";
import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
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
  MIN_COLUMN_WIDTH,
  TABLE_THEME_PARAMS,
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
      <span className={styles.headerName}>{headerName}</span>
    </div>
  );
};

export default function TableView() {
  // Custom theme for the table
  const theme = themeQuartz.withParams(TABLE_THEME_PARAMS);

  // Dummy data for now. Will be replaced with actual bookings data.
  const [rowData] = useState<ScheduleInformation[]>(
    Array.from({ length: 15 }, () => ({
      CREATED_AT: "2025-09-12T10:00:00Z",
      CLIENT_NAME: "Jason Thompson",
      TELEPHONE: "403-123-4567",
      DATE_BOOKED: "2025-09-26T12:00:00",
      TIME_BOOKED: "2025-09-26T12:00:00",
      AGENCY: "Amazing Agency",
      LOCATION: "123 Something St NW",
    })),
  );

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
    <div className={`ag-theme-quartz ${styles.tableContainer}`}>
      <AgGridReact
        theme={theme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        pagination={false}
      />
    </div>
  );
}
