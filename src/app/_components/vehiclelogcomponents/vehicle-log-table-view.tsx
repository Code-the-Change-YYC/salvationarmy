"use client";
import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
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

export default function VehicleLogTableView() {
  // register community modules for ag grid
  useEffect(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);

  // Custom theme for the table
  const theme = themeQuartz.withParams(TABLE_THEME_PARAMS);

  // Mock data for now - will be replaced with actual vehicle logs data
  const [rowData] = useState<VehicleLogData[]>([
    {
      DATE: "2025-09-12",
      DESTINATION: "123 Place NE, Calgary",
      DEPARTURE_TIME: "2025-09-12T12:00:00",
      ARRIVAL_TIME: "2025-09-12T12:26:00",
      ODOMETER_START: 12000,
      ODOMETER_END: 12026,
      KM_DRIVEN: 26,
      DRIVER: "Patrick Star",
    },
    {
      DATE: "2025-09-12",
      DESTINATION: "Dorchester Square Office Tower, Unit 933, 505 Burrard Street, Calgary",
      DEPARTURE_TIME: "2025-09-12T12:00:00",
      ARRIVAL_TIME: "2025-09-12T12:26:00",
      ODOMETER_START: 12000,
      ODOMETER_END: 12026,
      KM_DRIVEN: 26,
      DRIVER: "Patrick Star",
    },
    {
      DATE: "2025-09-12",
      DESTINATION: "123 Place NE, Calgary",
      DEPARTURE_TIME: "2025-09-12T12:00:00",
      ARRIVAL_TIME: "2025-09-12T12:26:00",
      ODOMETER_START: 12000,
      ODOMETER_END: 12026,
      KM_DRIVEN: 26,
      DRIVER: "Patrick Star",
    },
    {
      DATE: "2025-09-12",
      DESTINATION: "123 Place NE, Calgary",
      DEPARTURE_TIME: "2025-09-12T12:00:00",
      ARRIVAL_TIME: "2025-09-12T12:26:00",
      ODOMETER_START: 12000,
      ODOMETER_END: 12026,
      KM_DRIVEN: 26,
      DRIVER: "Patrick Star",
    },
    {
      DATE: "2025-09-12",
      DESTINATION: "123 Place NE, Calgary",
      DEPARTURE_TIME: "2025-09-12T12:00:00",
      ARRIVAL_TIME: "2025-09-12T12:26:00",
      ODOMETER_START: 12000,
      ODOMETER_END: 12026,
      KM_DRIVEN: 26,
      DRIVER: "Patrick Star",
    },
  ]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        ...createColumnDef(COLUMN_IDS.DATE),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => dayjs(params.value).format("MMM D, YYYY"),
      },
      {
        ...createColumnDef(COLUMN_IDS.DESTINATION),
        headerComponent: HeaderWithIcon,
        flex: 2,
      },
      {
        ...createColumnDef(COLUMN_IDS.DEPARTURE_TIME),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => dayjs(params.value).format("h:mm A"),
      },
      {
        ...createColumnDef(COLUMN_IDS.ARRIVAL_TIME),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => dayjs(params.value).format("h:mm A"),
      },
      {
        ...createColumnDef(COLUMN_IDS.ODOMETER_START),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => `${params.value.toLocaleString()} KM`,
      },
      {
        ...createColumnDef(COLUMN_IDS.ODOMETER_END),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => `${params.value.toLocaleString()} KM`,
      },
      {
        ...createColumnDef(COLUMN_IDS.KM_DRIVEN),
        headerComponent: HeaderWithIcon,
        valueFormatter: (params) => `${params.value} KM`,
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
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={false}
      />
    </div>
  );
}
