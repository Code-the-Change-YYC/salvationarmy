"use client";
import { Alert, Box, Loader } from "@mantine/core";
import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import { useMemo } from "react";
import Arrow from "@/assets/icons/arrow";
import Calendar from "@/assets/icons/calendar";
import CirclePause from "@/assets/icons/circle-pause";
import Clock from "@/assets/icons/clock";
import Location from "@/assets/icons/location";
import Play from "@/assets/icons/play";
import User from "@/assets/icons/user";
import Vehicle from "@/assets/icons/vehicle";
import {
  COLUMN_IDS,
  createColumnDef,
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  TABLE_THEME_PARAMS,
} from "@/constants/VehicleLogTableConstants";
import { api } from "@/trpc/react";
import styles from "./vehicle-log-table-view.module.scss";

ModuleRegistry.registerModules([AllCommunityModule]);

export interface VehicleLogData {
  ID: number;
  DATE: string;
  DESTINATION: string;
  DEPARTURE_TIME: string;
  ARRIVAL_TIME: string;
  ODOMETER_START: number;
  ODOMETER_END: number;
  KM_DRIVEN: number;
  DRIVER: string;
  VEHICLE: string;
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
      case COLUMN_IDS.VEHICLE:
        return <Vehicle width="16px" height="16px" />;
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

  // Fetch vehicle logs from database
  const { data: vehicleLogs = [], isLoading, isError } = api.vehicleLogs.getAll.useQuery();

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
      {
        ...createColumnDef(COLUMN_IDS.VEHICLE),
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
      {isLoading ? (
        <Box className={styles.loadingContainer}>
          <Loader color="#A03145" type="dots" />
        </Box>
      ) : isError ? (
        <Box className={styles.errorContainer}>
          <Alert variant="light" color="red">
            Failed to load vehicle logs. Please try again later.
          </Alert>
        </Box>
      ) : (
        <AgGridReact
          theme={theme}
          rowData={vehicleLogs}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          onRowClicked={(event) => event.data && onRowClick?.(event.data)}
        />
      )}
    </div>
  );
}
