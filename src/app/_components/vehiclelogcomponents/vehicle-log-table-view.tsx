"use client";
import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import Arrow from "@/assets/icons/arrow";
import Calendar from "@/assets/icons/calendar";
import CirclePause from "@/assets/icons/circle-pause";
import Clock from "@/assets/icons/clock";
import Location from "@/assets/icons/location";
import Play from "@/assets/icons/play";
import User from "@/assets/icons/user";
import {
  COLUMN_IDS,
  createColumnDef,
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  TABLE_THEME_PARAMS,
} from "@/constants/VehicleLogTableConstants";
import styles from "./vehicle-log-table-view.module.scss";

ModuleRegistry.registerModules([AllCommunityModule]);

interface VehicleLogData {
  DATE: string;
  DESTINATION: string;
  DEPARTURE_TIME: string;
  ARRIVAL_TIME: string;
  ODOMETER_START: number;
  ODOMETER_END: number;
  KM_DRIVEN: number;
  DRIVER: string;
}

interface VehicleLogTableViewProps {
  onRowClick?: (log: VehicleLogData) => void;
}

const HeaderWithIcon = (params: IHeaderParams) => {
  const columnId = params.column?.getColId();
  const headerName = params.displayName || "";

  const getIcon = () => {
    switch (columnId) {
      case COLUMN_IDS.DATE:
        return <Calendar width="16px" height="16px" />;
      case COLUMN_IDS.DESTINATION:
        return <Location width="16px" height="16px" />;
      case COLUMN_IDS.DEPARTURE_TIME:
      case COLUMN_IDS.ARRIVAL_TIME:
        return <Clock width="16px" height="16px" />;
      case COLUMN_IDS.ODOMETER_START:
        return <Play width="16px" height="16px" />;
      case COLUMN_IDS.ODOMETER_END:
        return <CirclePause width="16px" height="16px" />;
      case COLUMN_IDS.KM_DRIVEN:
        return <Arrow width="16px" height="16px" strokeWidth="3" />;
      case COLUMN_IDS.DRIVER:
        return <User width="16px" height="16px" />;
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

export default function VehicleLogTableView({ onRowClick }: VehicleLogTableViewProps = {}) {
  // Custom theme for the table
  const theme = themeQuartz.withParams(TABLE_THEME_PARAMS);

  // TODO: Replace with tRPC query to fetch vehicle logs from database
  const [vehicleLogs] = useState<VehicleLogData[]>([
    {
      DATE: "2026-01-10",
      DESTINATION: "Calgary General Hospital, 841 Centre Ave E, Calgary, AB",
      DEPARTURE_TIME: "2026-01-10T09:00:00",
      ARRIVAL_TIME: "2026-01-10T10:30:00",
      ODOMETER_START: 10000,
      ODOMETER_END: 10035,
      KM_DRIVEN: 35,
      DRIVER: "John Smith",
    },
    {
      DATE: "2026-01-11",
      DESTINATION: "Real Canadian Superstore, 1130 37 St SW, Calgary, AB",
      DEPARTURE_TIME: "2026-01-11T14:00:00",
      ARRIVAL_TIME: "2026-01-11T16:00:00",
      ODOMETER_START: 10035,
      ODOMETER_END: 10060,
      KM_DRIVEN: 25,
      DRIVER: "Sarah Johnson",
    },
    {
      DATE: "2026-01-12",
      DESTINATION: "Eau Claire Market, 200 Barclay Parade SW, Calgary, AB",
      DEPARTURE_TIME: "2026-01-12T10:00:00",
      ARRIVAL_TIME: "2026-01-12T12:00:00",
      ODOMETER_START: 10060,
      ODOMETER_END: 10078,
      KM_DRIVEN: 18,
      DRIVER: "Mike Williams",
    },
    {
      DATE: "2026-01-13",
      DESTINATION: "Shoppers Drug Mart, 1020 16 Ave NW, Calgary, AB",
      DEPARTURE_TIME: "2026-01-13T11:00:00",
      ARRIVAL_TIME: "2026-01-13T12:00:00",
      ODOMETER_START: 10078,
      ODOMETER_END: 10092,
      KM_DRIVEN: 14,
      DRIVER: "John Smith",
    },
    {
      DATE: "2026-01-13",
      DESTINATION: "TD Canada Trust, 700 2 St SW, Calgary, AB",
      DEPARTURE_TIME: "2026-01-13T15:00:00",
      ARRIVAL_TIME: "2026-01-13T16:30:00",
      ODOMETER_START: 10092,
      ODOMETER_END: 10118,
      KM_DRIVEN: 26,
      DRIVER: "Sarah Johnson",
    },
  ]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        ...createColumnDef(COLUMN_IDS.DATE),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return dayjs(params.value).format("MMM D, YYYY");
        },
      },
      {
        ...createColumnDef(COLUMN_IDS.DESTINATION),
        headerComponent: HeaderWithIcon,
        flex: 2,
      },
      {
        ...createColumnDef(COLUMN_IDS.DEPARTURE_TIME),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return dayjs(params.value).format("h:mm A");
        },
      },
      {
        ...createColumnDef(COLUMN_IDS.ARRIVAL_TIME),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return dayjs(params.value).format("h:mm A");
        },
      },
      {
        ...createColumnDef(COLUMN_IDS.ODOMETER_START),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => {
          if (params.value == null) return "";
          return `${params.value.toLocaleString()} KM`;
        },
      },
      {
        ...createColumnDef(COLUMN_IDS.ODOMETER_END),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => {
          if (params.value == null) return "";
          return `${params.value.toLocaleString()} KM`;
        },
      },
      {
        ...createColumnDef(COLUMN_IDS.KM_DRIVEN),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => {
          if (params.value == null) return "";
          return `${params.value} KM`;
        },
      },
      {
        ...createColumnDef(COLUMN_IDS.DRIVER),
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
        rowData={vehicleLogs}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={false}
        onRowClicked={(event) => onRowClick?.(event.data)}
      />
    </div>
  );
}
