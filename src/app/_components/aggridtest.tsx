"use client";

import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import { authClient } from "@/lib/auth-client";

// register community modules for ag grid
ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

const AgGridTest = () => {
  const [rowData, _setRowData] = useState<IRow[]>([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Mercedes", model: "EQA", price: 48890, electric: true },
    { make: "Fiat", model: "500", price: 15774, electric: false },
    { make: "Nissan", model: "Juke", price: 20675, electric: false },
  ]);

  const [colDefs, _setColDefs] = useState<ColDef<IRow>[]>([
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
  };

  const handleSignUp = async () => {
    const result = await authClient.signUp.email({
      email: "email@domain.com",
      name: "Test User",
      password: "testtesttest",
    });
    console.log(result);
  };

  return (
    <div style={{ width: "90vw", height: "500px" }}>
      <AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDef} />
      <Button onClick={handleSignUp}>Sign up test user </Button>
    </div>
  );
};

export default AgGridTest;
