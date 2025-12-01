import ContentHeader from "@/components/ContentHeader";
import Toolbar from "@/components/Toolbar";
import React from "react";

export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col p-10 max-sm:px-4 space-y-10">
      <ContentHeader />
    
      {children}
    </div>
  );
}
