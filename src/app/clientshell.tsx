"use client";

import Header from "@/components/nav/header";
import { useUI } from "@/components/ui/UIContext";
import React from "react";
import { usePathname } from "next/navigation";

type ClientShellProps = {
  children: React.ReactNode;
  authToken: boolean;
};

export default function ClientShell({ children, authToken }: ClientShellProps) {
  const { isMiniSidebar } = useUI();
  const pathname = usePathname();

  const hideHeader = pathname === "/signin" || pathname === "/signup";

  return (
    <div className="container">
      {/* {authToken && <Nav />} */}

      {authToken ? (
        <main
          className={`main_content ${isMiniSidebar ? "full_main_content" : ""}`}
        >
          {!hideHeader && <Header />}
          <div
            className={
              !hideHeader ? "border-start border-end border-bottom " : ""
            }
            style={!hideHeader ? { background: "#f7f8fc" } : {}}
          >
            {children}
          </div>
        </main>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
