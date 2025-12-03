"use client";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useState } from "react";
import {
  COLUMN_IDS,
  createColumnDef,
  DEFAULT_COLUMN_WIDTH,
} from "@/constants/TableScheduleConstants";
import type { ScheduleInformation } from "@/types/types";

// register community modules for ag grid
ModuleRegistry.registerModules([AllCommunityModule]);

const Schedule = () => {
  // fake data for now
  const [rowData, setRowData] = useState<ScheduleInformation[]>([
    {
      CREATED_AT: "2023-10-01T10:00:00Z",
      CLIENT_NAME: "John Doe",
      TELEPHONE: "123-456-7890",
      DATE_BOOKED: "2023-10-15",
      TIME_BOOKED: "14:00",
      AGENCY: "Agency A",
      LOCATION: "Location 1",
    },
    {
      CREATED_AT: "2023-10-02T11:30:00Z",
      CLIENT_NAME: "Jane Smith",
      TELEPHONE: "987-654-3210",
      DATE_BOOKED: "2023-10-16",
      TIME_BOOKED: "09:30",
      AGENCY: "Agency B",
      LOCATION: "Location 2",
    },
  ]);

  const columnDefs: ColDef[] = [
    {
      ...createColumnDef(COLUMN_IDS.CREATED_AT),
    },
    {
      ...createColumnDef(COLUMN_IDS.CLIENT_NAME),
    },
    {
      ...createColumnDef(COLUMN_IDS.TELEPHONE),
    },
    {
      ...createColumnDef(COLUMN_IDS.DATE_BOOKED),
    },
    {
      ...createColumnDef(COLUMN_IDS.TIME_BOOKED),
    },
    {
      ...createColumnDef(COLUMN_IDS.AGENCY),
    },
    {
      ...createColumnDef(COLUMN_IDS.LOCATION),
    },
  ];

  const defaultColDef: ColDef = {
    flex: 1,
    width: DEFAULT_COLUMN_WIDTH,
    resizable: true,
    sortable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-quartz" style={{ width: "90vw", height: "500px" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        rowSelection="multiple"
      />
    </div>
  );
};

export default Schedule;
