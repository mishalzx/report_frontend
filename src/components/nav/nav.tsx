// components/Nav.tsx
"use client";
import React, { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUI } from "../ui/UIContext";
import { useOnClickOutside } from "../ui/useOnClickOutside";
import logo from "../../../public/Ariflex Logo-01.png";
import Image from "next/image";
import dash from "../../../public/dashboard.svg";
import code from "../../../public/2.svg";

type MenuChild = { label: string; href: string };
type MenuItem = { label: string; icon?: any; href?: string; children?: MenuChild[] };

const MENU: MenuItem[] = [

   {
    label: "Home", href:"dashboard",
    icon: dash,
        children: [
      { label: "Dashborad", href: "/dashboard" },
     
    ],
  },

  {
    label: "User Management",
    icon: dash,
    children: [
      { label: "Questionnaire", href: "/questionnaire" },
      
    ],
  },
  {
    label: "Application",
    icon:code,
    children: [
      { label: "editor", href: "/editor.html" },
      { label: "Mail Box", href: "/mail_box.html" },
      { label: "Chat", href: "/chat.html" },
      { label: "FAQ", href: "/faq.html" },
    ],
  },
  // TODO: add the rest of your items here following the same shape
];

export default function Nav() {
  const pathname = usePathname() || "/";
  const { isSidebarOpen, setSidebarOpen, isMiniSidebar } = useUI();

  const sideRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(sideRef, () => setSidebarOpen(false));

  const defaultExpanded = useMemo(() => {
    const s = new Set<number>();
    MENU.forEach((m: MenuItem, i: number) => {
      if (m.children?.some((c: MenuChild) => pathname.includes(stripHtml(c.href)))) s.add(i);
    });
    return s;
  }, [pathname]);

  const [expanded, setExpanded] = useState<Set<number>>(defaultExpanded);
  const toggle = (i: number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <nav
      ref={sideRef}
      className={`sidebar ${isMiniSidebar ? "mini_sidebar" : ""} ${isSidebarOpen ? "active_sidebar" : ""}`}
    >
      {/* ... logo block ... */}
      <div className="logo d-flex justify-content-between">
        <a className="large_logo"><Image width={170} src={logo} alt=""/></a>
        <a className="small_logo" href=""><Image width={80} src={logo} alt=""/></a>
        <div className="sidebar_close_icon d-lg-none">
            <i className="ti-close"></i>
        </div>
    </div>
      <ul id="sidebar_menu" className="metismenu">
        {MENU.map((m: MenuItem, i: number) => {
          const hasChildren = !!m.children?.length;
          const isOpen = expanded.has(i);
          return (
            <li key={i} className={isOpen ? "mm-active" : ""}>
              {hasChildren ? (
                <>
                  <a type="button" className="has-arrow" aria-expanded={isOpen} onClick={() => toggle(i)}>
                    <div className="nav_icon_small"><Image width={50} height={15} src={m.icon} alt="" /></div>
                    <div className="nav_title"><span>{m.label}</span></div>
                  </a>
                  <ul className={`mm-collapse ${isOpen ? "mm-show" : ""}`}>
                    {m.children!.map((c: MenuChild) => {
                      const active = pathname.includes(stripHtml(c.href));
                      return (
                        <li key={c.href}>
                          <a className={active ? "active" : ""} href={c.href}>{c.label}</a>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <a href={m.href || "#"} aria-expanded="false">
                  <div className="nav_icon_small"><img src={m.icon} alt="" /></div>
                  <div className="nav_title"><span>{m.label}</span></div>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function stripHtml(href?: string): string {
  if (!href) return "/";
  return href.replace(/^https?:\/\/[^/]+/i, "");
}
