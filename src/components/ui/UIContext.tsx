// ui/UIContext.tsx
"use client";
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

type UIContextType = {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isMiniSidebar: boolean;
  toggleMiniSidebar: () => void;
  isSearchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  isNotifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  isChatOpen: boolean;
  setChatOpen: (v: boolean) => void;
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMiniSidebar, setMiniSidebar] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);

  const toggleMiniSidebar = useCallback(() => setMiniSidebar(v => !v), []);

  const value = useMemo(() => ({
    isSidebarOpen, setSidebarOpen,
    isMiniSidebar, toggleMiniSidebar,
    isSearchOpen, setSearchOpen,
    isNotifOpen, setNotifOpen,
    isChatOpen, setChatOpen,
  }), [isSidebarOpen, isMiniSidebar, isSearchOpen, isNotifOpen, isChatOpen, toggleMiniSidebar]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
};
