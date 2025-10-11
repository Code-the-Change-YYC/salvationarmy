import type { ColDef } from "ag-grid-community";

export const DEFAULT_COLUMN_WIDTH = 250;

export const COLUMN_IDS = {
  CREATED_AT: "CREATED_AT",
  CLIENT_NAME: "CLIENT_NAME",
  TELEPHONE: "TELEPHONE",
  DATE_BOOKED: "DATE_BOOKED",
  TIME_BOOKED: "TIME_BOOKED",
  AGENCY: "AGENCY",
  LOCATION: "LOCATION",
} as const;

export const COLUMN_HEADERS = {
  [COLUMN_IDS.CREATED_AT]: "Created At",
  [COLUMN_IDS.CLIENT_NAME]: "Client Name",
  [COLUMN_IDS.TELEPHONE]: "Telephone",
  [COLUMN_IDS.DATE_BOOKED]: "Date Booked",
  [COLUMN_IDS.TIME_BOOKED]: "Time Booked",
  [COLUMN_IDS.AGENCY]: "Agency",
  [COLUMN_IDS.LOCATION]: "Location",
} as const;

//todo, add icons to the column def
export const COLUMN_ICONS = {
  [COLUMN_IDS.CREATED_AT]: "Created At",
  [COLUMN_IDS.CLIENT_NAME]: "Client Name",
  [COLUMN_IDS.TELEPHONE]: "Telephone",
  [COLUMN_IDS.DATE_BOOKED]: "Date Booked",
  [COLUMN_IDS.TIME_BOOKED]: "Time Booked",
  [COLUMN_IDS.AGENCY]: "Agency",
  [COLUMN_IDS.LOCATION]: "Location",
} as const;

export const createColumnDef = (columnId: keyof typeof COLUMN_IDS): Partial<ColDef> => ({
  field: COLUMN_IDS[columnId],
  headerName: COLUMN_HEADERS[COLUMN_IDS[columnId]],
});
