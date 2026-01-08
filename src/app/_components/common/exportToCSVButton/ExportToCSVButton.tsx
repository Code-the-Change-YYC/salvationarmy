"use client";

import type { UseTRPCQueryResult } from "node_modules/@trpc/react-query/dist/getQueryKey.d-CruH3ncI.mjs";
import type { JSONArray, JSONObject } from "node_modules/superjson/dist/types";
import Button from "@/app/_components/common/button/Button";
import Grid from "@/assets/icons/grid";
import { notify } from "@/lib/notifications";

/**
 * Helper function.
 * Creates a CSV download function.
 * @param tableData Data used during download
 * @returns A function that initiates CSV file download when called
 */
export function downloadCSVWithoutEndpoint(tableData: JSONArray): (...args: any[]) => void {
  return () => {
    let csvFileString = ""; //Will hold the CSV file contents as a string to convert to blob later

    for (const key in tableData[0] as JSONObject) {
      //Keys in first row (JSON) become file column headers
      csvFileString = csvFileString + key + ",";
    }

    csvFileString = csvFileString.slice(0, -1); //Remove the last ,
    csvFileString = csvFileString + "\n"; //Add a newline

    for (let jsonObject of tableData) {
      jsonObject = jsonObject as JSONObject; //Assert its type for TS
      for (const key in jsonObject) {
        csvFileString = csvFileString + jsonObject[key] + ",";
      }
      csvFileString = csvFileString.slice(0, -1); //Remove the last ,
      csvFileString = csvFileString + "\n"; //Add a newline
    }

    const blob = new Blob([csvFileString], { type: "text/csv" }); //Turn CSV string into blob
    const downloadURL = URL.createObjectURL(blob); //Turn blob into a URL
    const downloadElement = document.createElement("a");
    downloadElement.href = downloadURL;
    document.body.appendChild(downloadElement);
    downloadElement.click(); //Force the element to click, causing the file download
    URL.revokeObjectURL(downloadURL); //Remove the URL for the blob
    document.body.removeChild(downloadElement); //Remove the temp element
  };
}

/**
 * Helper function.
 * Feeds table data to downloadCSVWithoutEndpoint.
 * Use if a query's table data does not need to be altered.
 * @param endpointQuery A TPRC query to extract table data using
 * @returns A function that initiates CSV file download when called
 */
export function downloadCSVWithEndpoint<TData, TError>(
  endpointQuery: UseTRPCQueryResult<TData, TError>,
): (...args: any[]) => void {
  return async () => {
    const result = await endpointQuery.refetch(); //Call the passed query function

    if (result.error) {
      //There's an error
      notify.error("Query failed!");
    } else if (Array.isArray(result.data) && typeof result.data[0] === "object") {
      //result.data is an array of objects
      const jsonArray = result.data as JSONArray; //Assert that this is a JSONArray
      const downloadCSVFunc = downloadCSVWithoutEndpoint(jsonArray); //Call other helper to get downloader function

      downloadCSVFunc(); //Run the downloader function
    } else {
      //result.data is NOT an array of objects
      notify.error("Query returned invalid data!");
    }
  };
}

interface ExportToCSVButtonProps {
  downloadFunction?: (...args: any[]) => void; //Variable is of type function
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
