"use client";

import React from "react";
import { useUI } from "@/components/ui/UIContext";
import Nav from "@/components/nav/nav";
import Header from "@/components/nav/header";

type ClientShellProps = {
  children: React.ReactNode;
  authToken: boolean; // match the name and type
};

export default function ClientShell({ children, authToken }: ClientShellProps) {
  const { isMiniSidebar } = useUI();

  console.log("authToken:", authToken);

  return (
    <>
      {authToken && <Nav />}

      {authToken ? (
        <main className={`main_content ${isMiniSidebar ? "full_main_content" : ""}`}>
          <Header />
          {children}
        </main>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
