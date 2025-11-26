"use client";

import Header from "@/components/nav/header";
import { useUI } from "@/components/ui/UIContext";
import React from "react";

type ClientShellProps = {
  children: React.ReactNode;
  authToken: boolean; // match the name and type
};

export default function ClientShell({ children, authToken }: ClientShellProps) {
  const { isMiniSidebar } = useUI();

  return (
    <div className="container">
      {/* {authToken && <Nav />} */}

      {authToken ? (
        <main
          className={`main_content ${isMiniSidebar ? "full_main_content" : ""}`}
        >
          <Header />
          <div className="border-start border-end border-bottom">
            {" "}
            {children}
          </div>
        </main>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
