import type { ColDef } from "ag-grid-community";

export const DEFAULT_COLUMN_WIDTH = 150;
export const MIN_COLUMN_WIDTH = 125;

export const COLUMN_IDS = {
  PASSENGER_INFO: "passengerInfo",
  DEPARTURE_TIME: "timeOfDeparture",
  PASSENGER_RATING: "passengerFitRating",
  LOCATION_CHANGED: "originalLocationChanged",
  COMMENTS: "comments",
} as const;

export const COLUMN_HEADERS = {
  [COLUMN_IDS.PASSENGER_INFO]: "Passenger name",
  [COLUMN_IDS.DEPARTURE_TIME]: "Transport Date",
  [COLUMN_IDS.PASSENGER_RATING]: "Fitness rating",
  [COLUMN_IDS.LOCATION_CHANGED]: "Did Passenger Request to be dropped off at a different location?",
  [COLUMN_IDS.COMMENTS]: "Additional Notes",
} as const;

export const createColumnDef = (columnId: keyof typeof COLUMN_IDS): Partial<ColDef> => ({
  colId: COLUMN_IDS[columnId],
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
