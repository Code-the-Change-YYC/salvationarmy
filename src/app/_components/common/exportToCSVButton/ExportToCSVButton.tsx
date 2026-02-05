"use client";

import type { AgGridReact } from "ag-grid-react";
import type { RefObject } from "react";
import Button from "@/app/_components/common/button/Button";
import Grid from "@/assets/icons/grid";
import { notify } from "@/lib/notifications";

/**
 * Helper function.
 * Wraps AgGrid's .exportDataAsCsv() in a function for the ExportToCSVButton.
 * @param agGrid Reference to an AgGrid
 * @returns A function that initiates CSV file download when called
 */
export function defaultFunction(agGrid: RefObject<AgGridReact | null>): () => void {
  return () => {
    if (agGrid.current !== null) {
      agGrid.current.api.exportDataAsCsv();
    } else {
      notify.error("Invalid reference to AgGrid!");
    }
  };
}

interface ExportToCSVButtonProps {
  downloadFunction?: () => void; //Variable is of type function
}

export default function ExportToCSVButton({ downloadFunction }: ExportToCSVButtonProps) {
  return (
    <Button
      text="Export to CSV File"
      variant="secondary"
      icon={<Grid />}
      onClick={downloadFunction}
    />
  );
}
