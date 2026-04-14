"use client";

import type { ColDef, IHeaderParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import { useMemo } from "react";
import Edit from "@/assets/icons/edit";
import Mail from "@/assets/icons/mail";
import Rating1 from "@/assets/icons/rating1";
import Rating2 from "@/assets/icons/rating2";
import Rating3 from "@/assets/icons/rating3";
import Rating4 from "@/assets/icons/rating4";
import Rating5 from "@/assets/icons/rating5";
import {
  COLUMN_IDS,
  createColumnDef,
  MIN_COLUMN_WIDTH,
  TABLE_THEME_PARAMS,
} from "@/constants/RiderLogTableConstants";
import { api } from "@/trpc/react";
import styles from "./rider-log-table-view.module.scss";

ModuleRegistry.registerModules([AllCommunityModule]);

export interface RiderLogData {
  timeOfDeparture: string | null;
  originalLocationChanged: boolean | null;
  passengerFitRating: number | null;
  passengerInfo: string | null;
  comments: string | null;
}

interface RiderLogTableViewProps {
  onRowClick?: (log: RiderLogData) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Neutral",
  4: "Good",
  5: "Excellent",
};

const RatingIcon = ({ value }: { value: number }) => {
  const props = { width: "18px", height: "18px", fill: "none" };
  switch (value) {
    case 1:
      return <Rating1 {...props} />;
    case 2:
      return <Rating2 {...props} />;
    case 3:
      return <Rating3 {...props} />;
    case 4:
      return <Rating4 {...props} />;
    case 5:
      return <Rating5 {...props} />;
    default:
      return null;
  }
};

const HeaderWithIcon = (params: IHeaderParams) => {
  const columnId = params.column?.getColId();
  const headerName = params.displayName || "";

  const getIcon = () => {
    switch (columnId) {
      case "passengerInfo":
      case "timeOfDeparture":
      case "passengerFitRating":
        return <Edit width="16px" height="16px" />;
      case "originalLocationChanged":
      case "comments":
        return <Mail width="16px" height="16px" />;
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

export default function RiderLogTableView({ onRowClick }: RiderLogTableViewProps = {}) {
  const theme = themeQuartz.withParams(TABLE_THEME_PARAMS);

  const { data: riderLogs = [] } = api.surveys.getAll.useQuery();

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        ...createColumnDef("PASSENGER_INFO"),
        headerComponent: HeaderWithIcon,
        flex: 1,
      },
      {
        ...createColumnDef("DEPARTURE_TIME"),
        headerComponent: HeaderWithIcon,
        flex: 1,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return dayjs(params.value).format("MMM D, YYYY");
        },
      },
      {
        ...createColumnDef("PASSENGER_RATING"),
        headerComponent: HeaderWithIcon,
        flex: 1,
        cellRenderer: (params: { value: number | null }) => {
          if (params.value == null) return "";
          const label = RATING_LABELS[params.value] ?? "";
          return (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RatingIcon value={params.value} />
              {label}
            </span>
          );
        },
      },
      {
        ...createColumnDef("LOCATION_CHANGED"),
        headerComponent: HeaderWithIcon,
        flex: 1,
        cellRenderer: (params: { value: boolean | null }) => {
          if (params.value == null) return "";
          return params.value ? "Yes" : "No";
        },
      },
      {
        ...createColumnDef("COMMENTS"),
        headerComponent: HeaderWithIcon,
        flex: 1,
        cellStyle: {
          whiteSpace: "normal",
          lineHeight: "1.4",
          display: "flex",
          alignItems: "center",
        },
        autoHeight: true,
      },
    ],
    [],
  );

  const defaultColDef: ColDef = {
    minWidth: MIN_COLUMN_WIDTH,
    resizable: false,
    sortable: true,
    filter: true,
  };

  return (
    <div className={styles.tableContainer}>
      <AgGridReact
        theme={theme}
        rowData={riderLogs}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={false}
        onRowClicked={(event) => event.data && onRowClick?.(event.data)}
      />
    </div>
  );
}
