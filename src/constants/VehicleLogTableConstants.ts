import type { ColDef } from "ag-grid-community";

export const DEFAULT_COLUMN_WIDTH = 150;
export const MIN_COLUMN_WIDTH = 125;

export const COLUMN_IDS = {
  DATE: "DATE",
  DESTINATION: "DESTINATION",
  DEPARTURE_TIME: "DEPARTURE_TIME",
  ARRIVAL_TIME: "ARRIVAL_TIME",
  ODOMETER_START: "ODOMETER_START",
  ODOMETER_END: "ODOMETER_END",
  KM_DRIVEN: "KM_DRIVEN",
  DRIVER: "DRIVER",
  VEHICLE: "VEHICLE",
} as const;

export const COLUMN_HEADERS = {
  [COLUMN_IDS.DATE]: "Date of Transport",
  [COLUMN_IDS.DESTINATION]: "Destination",
  [COLUMN_IDS.DEPARTURE_TIME]: "Departure Time",
  [COLUMN_IDS.ARRIVAL_TIME]: "Arrival Time",
  [COLUMN_IDS.ODOMETER_START]: "Odometer Start",
  [COLUMN_IDS.ODOMETER_END]: "Odometer End",
  [COLUMN_IDS.KM_DRIVEN]: "KM Driven",
  [COLUMN_IDS.DRIVER]: "Driver",
  [COLUMN_IDS.VEHICLE]: "Vehicle",
} as const;

export const createColumnDef = (columnId: keyof typeof COLUMN_IDS): Partial<ColDef> => ({
  field: COLUMN_IDS[columnId],
  headerName: COLUMN_HEADERS[COLUMN_IDS[columnId]],
});

export const TABLE_THEME_PARAMS = {
  fontFamily: "var(--font-albert-sans), sans-serif",
  wrapperBorder: false,
  columnBorder: true,
  headerBackgroundColor: "transparent",
  spacing: "8px",
  headerTextColor: "var(--color-dark-grey)",
  cellTextColor: "var(--color-dark-grey)",
  borderColor: "var(--color-border)",
} as const;
