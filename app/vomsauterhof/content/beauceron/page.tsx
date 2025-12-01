import Toolbar from "@/components/Toolbar";
import BeauceronTable from "@/components/beauceron/BeauceronTable";
import Documents from "@/components/beauceron/documents/Documents";
import React from "react";

function Page() {
  return (
    <>
      <Toolbar />
      <BeauceronTable />
      <Documents />
    </>
  );
}

export default Page;
