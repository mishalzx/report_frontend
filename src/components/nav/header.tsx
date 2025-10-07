// components/Header.tsx
"use client";
import React, { useRef, useState } from "react";
import { useOnClickOutside } from "../ui/useOnClickOutside";
import { useUI } from "../ui/UIContext";
import line from "../../../public/line_img.png"
import search from "../../../public/icon_search.svg"
import Image from "next/image";
import user from "../../../public/user.avif"
export default function Header() {
  const {
    setSidebarOpen,
    toggleMiniSidebar,
    isSearchOpen, setSearchOpen,
    isNotifOpen, setNotifOpen,
    isChatOpen, setChatOpen,
  } = useUI();

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const chatRef   = useRef<HTMLDivElement>(null);

  useOnClickOutside(notifRef, () => setNotifOpen(false));
  useOnClickOutside(searchRef, () => setSearchOpen(false));
  useOnClickOutside(chatRef,   () => setChatOpen(false));

  // timers to avoid flicker on hover-out
  const [notifTimer, setNotifTimer] = useState<number | null>(null);
  const [chatTimer,  setChatTimer]  = useState<number | null>(null);

  const openOnHover = (openFn: (v: boolean)=>void, clearTimer: (id: number | null)=>void) => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return; // don't hover-open on touch
    openFn(true);
    if (notifTimer) { clearTimeout(notifTimer); clearTimer(null); }
    if (chatTimer)  { clearTimeout(chatTimer);  clearTimer(null); }
  };
  const closeDelayed = (
    closeFn: (v: boolean)=>void,
    setTimer: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return; // keep open for touch
    const id = window.setTimeout(() => closeFn(false), 120);
    setTimer(id);
  };

  return (
    <div className="container-fluid g-0">
      <div className="row">
        <div className="col-lg-12 p-0">
          <div className="header_iner d-flex justify-content-between align-items-center">
            <button className="sidebar_icon d-lg-none" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <i className="ti-menu" />
            </button>

            <a className="line_icon open_miniSide d-none d-lg-block" onClick={toggleMiniSidebar} aria-label="Toggle mini sidebar">
              <Image width={20} src={line} alt="" />
            </a>

            {/* SEARCH */}
            <div
              className={`serach_field-area d-flex align-items-center ${isSearchOpen ? "active" : ""}`}
              ref={searchRef}
              onMouseEnter={() => openOnHover(setSearchOpen, () => {})}
              onMouseLeave={() => closeDelayed(setSearchOpen, () => {})}
            >
              <div className="search_inner">
                <form action="#" onSubmit={(e)=>e.preventDefault()}>
                  <div className="search_field">
                    <input
                      type="text"
                      placeholder="Search"
                      onFocus={() => setSearchOpen(true)}
                    />
                  </div>
                  <button type="button" className="serach_button" onClick={() => setSearchOpen(true)}>
                    <Image src={search} alt="" />
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT ICONS */}
            <div className="header_right d-flex justify-content-between align-items-center">
              <ul className="header_notification_warp d-flex align-items-center">
                {/* NOTIFICATIONS */}
                

                {/* CHAT */}
              
              </ul>

              {/* Profile block unchanged */}
              <div className="profile_info">
                            <Image src={user} alt="#"/>
                            <div className="profile_info_iner">
                                <div className="profile_author_name">
                                    <p>Neurologist </p>
                                    <h5>Dr. Robar Smith</h5>
                                </div>
                                <div className="profile_info_details">
                                    <a href="#">My Profile </a>
                                    <a href="#">Settings</a>
                                    <a href="#">Log Out </a>
                                </div>
                            </div>
                        </div>
            </div>{/* /header_right */}
          </div>
        </div>
      </div>
    </div>
  );
}
