"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import ReactAvatar from "react-avatar";
import code from "../../../public/2.svg";
import logo from "../../../public/Ariflex Logo-01.png";
import dash from "../../../public/dashboard.svg";
import search from "../../../public/icon_search.svg";
import { useUI } from "../ui/UIContext";
import { useOnClickOutside } from "../ui/useOnClickOutside";
import "./header.css";

const MENU = [
  {
    label: "Home",
    icon: dash,
    href: "/dashboard",
  },
  {
    label: "User Management",
    icon: dash,
    children: [{ label: "Questionnaire", href: "/questionnaire" }],
  },
  {
    label: "Application",
    icon: code,
    children: [
      { label: "Editor", href: "/editor.html" },
      { label: "Mail Box", href: "/mail_box.html" },
      { label: "Chat", href: "/chat.html" },
      { label: "FAQ", href: "/faq.html" },
    ],
  },
  // add more items as needed
];

export default function Header() {
  const { isSearchOpen, setSearchOpen } = useUI();

  // Ref for click outside search
  const searchRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(searchRef, () => setSearchOpen(false));

  // Dropdowns for nav items (for responsive menu)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [k: number]: boolean }>(
    {}
  );

  // For mobile nav/submenu expand/collapse
  function toggleMenu(i: number) {
    setExpandedMenus((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  }

  // Responsive nav menu toggling
  function handleMobileMenuToggle() {
    setMobileMenuOpen((v) => !v);
  }

  // Hamburger SVG icon (accessible)
  function HamburgerIcon({ open }: { open: boolean }) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: 28,
          height: 28,
          position: "relative",
          verticalAlign: "middle",
        }}
      >
        <span
          style={{
            background: "#222",
            borderRadius: 2,
            height: 3,
            width: 28,
            display: "block",
            position: "absolute",
            transition: "transform .2s, opacity .2s",
            top: open ? 13 : 6,
            left: 0,
            transform: open ? "rotate(45deg)" : "none",
          }}
        />
        <span
          style={{
            background: "#222",
            borderRadius: 2,
            height: 3,
            width: 28,
            display: "block",
            position: "absolute",
            top: 13,
            left: 0,
            opacity: open ? 0 : 1,
            transition: "opacity .2s",
          }}
        />
        <span
          style={{
            background: "#222",
            borderRadius: 2,
            height: 3,
            width: 28,
            display: "block",
            position: "absolute",
            top: open ? 13 : 20,
            left: 0,
            transform: open ? "rotate(-45deg)" : "none",
            transition: "transform .2s, top .2s",
          }}
        />
      </span>
    );
  }

  // Responsive & fully in-header nav
  return (
    <header
      className="ariflex-navbar w-100"
      style={{
        boxShadow: "0 2px 8px 0 rgba(0,0,0,.04)",
        background: "#fff",
        zIndex: 50,
      }}
    >
      <nav
        className="navbar-main px-2 py-2 d-flex align-items-center justify-content-between border-bottom border-start border-end"
        style={{ position: "relative", minHeight: 85 }}
      >
        {/* LOGO */}
        <div className="d-flex align-items-center flex">
          <Link
            href="/dashboard"
            className="navbar-logo d-flex align-items-center me-2"
            style={{ textDecoration: "none", minWidth: 80 }}
          >
            <Image height={36} src={logo} alt="Ariflex Logo" priority />
            <span
              className="d-none d-md-inline ms-2 fs-5 fw-bold"
              style={{ color: "#1e293b" }}
            >
              Ariflex
            </span>
          </Link>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="navbar-toggler d-inline-block d-lg-none p-1 ms-auto border-0 bg-transparent"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="responsive-navbar"
          onClick={handleMobileMenuToggle}
          style={{
            fontSize: 24,
            outline: "none",
            boxShadow: "none",
            zIndex: 1201,
            position: "relative",
          }}
        >
          <HamburgerIcon open={mobileMenuOpen} />
        </button>

        {/* NAVIGATION LINKS + RIGHT AREA */}
        {/* Mobile menu covers the rest of the header below lg */}
        <div
          id="responsive-navbar"
          className={`navbar-links collapse navbar-collapse ${
            mobileMenuOpen ? "show" : ""
          } d-lg-flex ms-lg-3`}
          style={{
            position: mobileMenuOpen ? "fixed" : "static",
            top: mobileMenuOpen ? 0 : 52,
            left: 0,
            width: mobileMenuOpen ? "100vw" : "100%",
            height: mobileMenuOpen ? "100vh" : "auto",
            background: mobileMenuOpen ? "#fff" : "#fff",
            zIndex: mobileMenuOpen ? 1200 : 999,
            boxShadow: mobileMenuOpen
              ? "0 8px 32px 0 rgba(0,0,0,.10)"
              : undefined,
            borderRadius: mobileMenuOpen ? 0 : 8,
            padding: mobileMenuOpen ? "24px 0 0 0" : 0,
            display:
              mobileMenuOpen || typeof window === "undefined"
                ? undefined
                : undefined,
            flexDirection: mobileMenuOpen ? "column" : undefined,
            justifyContent: mobileMenuOpen ? "flex-start" : undefined,
            alignItems: mobileMenuOpen ? "stretch" : undefined,
            overflowY: mobileMenuOpen ? "auto" : undefined,
            transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {/* Only show contents below lg if menu is open, otherwise, always show on desktop */}
          <div
            className={
              "w-100 d-lg-flex flex-lg-row align-items-lg-center justify-content-lg-between"
            }
            style={{
              flexDirection: mobileMenuOpen ? "column" : undefined,
              padding: mobileMenuOpen ? "0 24px" : undefined,
              alignItems: mobileMenuOpen ? "flex-start" : undefined,
              maxWidth: 1200,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* Navigation Links */}
            <ul
              className={`nav flex-column flex-lg-row align-items-start align-items-lg-center w-100 justify-content-lg-center gap-lg-2 p-0 m-0 ${
                mobileMenuOpen ? "navbar-mobile-ul" : ""
              }`}
              style={{
                listStyle: "none",
                marginBottom: mobileMenuOpen ? 32 : undefined,
              }}
            >
              {MENU.map((item, i) => {
                const hasChildren = item.children && item.children.length > 0;
                return (
                  <li key={i} className="nav-item w-lg-auto position-relative">
                    {hasChildren ? (
                      <>
                        <button
                          className="nav-link d-flex align-items-center w-100"
                          style={{
                            border: "none",
                            background: "none",
                            padding: "10px 16px",
                            fontWeight: 500,
                            fontSize: 16,
                            color: "#222",
                          }}
                          onClick={() => {
                            // Only toggle submenu on mobile
                            if (window.innerWidth < 992) {
                              toggleMenu(i);
                            }
                          }}
                          tabIndex={0}
                          aria-haspopup="true"
                          aria-expanded={!!expandedMenus[i]}
                          onMouseEnter={
                            typeof window !== "undefined" &&
                            window.innerWidth >= 992
                              ? () =>
                                  setExpandedMenus((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }))
                              : undefined
                          }
                          onMouseLeave={
                            typeof window !== "undefined" &&
                            window.innerWidth >= 992
                              ? () =>
                                  setExpandedMenus((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }))
                              : undefined
                          }
                        >
                          <Image
                            src={item.icon}
                            height={18}
                            alt=""
                            className="me-2"
                          />
                          <span>{item.label}</span>
                          <span className="ms-1" style={{ fontSize: 10 }}>
                            <i className="ti-angle-down" />
                          </span>
                        </button>
                        <ul
                          className={`dropdown-menu${
                            mobileMenuOpen ? " w-100" : ""
                          }`}
                          style={{
                            display:
                              mobileMenuOpen && expandedMenus[i]
                                ? "block"
                                : !mobileMenuOpen && expandedMenus[i]
                                ? "block"
                                : window.innerWidth < 992
                                ? expandedMenus[i]
                                  ? "block"
                                  : "none"
                                : "none",
                            position: mobileMenuOpen ? "static" : "absolute",
                            left: 0,
                            top: "100%",
                            minWidth: 160,
                            zIndex: 1000,
                            background: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: 8,
                            margin: 0,
                            marginTop: 2,
                            padding: mobileMenuOpen ? "6px 24px" : "8px 0",
                            boxShadow: "0 2px 16px rgba(0,0,0,.06)",
                          }}
                          onMouseEnter={
                            typeof window !== "undefined" &&
                            window.innerWidth >= 992
                              ? () =>
                                  setExpandedMenus((prev) => ({
                                    ...prev,
                                    [i]: true,
                                  }))
                              : undefined
                          }
                          onMouseLeave={
                            typeof window !== "undefined" &&
                            window.innerWidth >= 992
                              ? () =>
                                  setExpandedMenus((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }))
                              : undefined
                          }
                        >
                          {item.children &&
                            item.children.map((c, j) => (
                              <li key={c.href} style={{ width: "100%" }}>
                                <Link
                                  href={c.href}
                                  className="dropdown-item"
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 15,
                                    color: "#1e293b",
                                    textDecoration: "none",
                                    fontWeight: 500,
                                    borderRadius: 6,
                                    display: "block",
                                    width: "100%",
                                  }}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className="nav-link d-flex align-items-center w-100"
                        style={{
                          fontWeight: 500,
                          padding: "10px 18px",
                          fontSize: 16,
                          color: "#222",
                        }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Image
                          src={item.icon}
                          height={18}
                          alt=""
                          className="me-2"
                        />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            {/* SEARCH, RIGHT AREA */}
            <div
              className={`header_right d-flex align-items-center gap-1 ms-auto ms-lg-2 ${
                mobileMenuOpen
                  ? "flex-column align-items-start w-100 gap-3 pt-2 pb-4"
                  : ""
              }`}
              style={{
                borderTop: mobileMenuOpen ? "1px solid #f4f4f4" : undefined,
                marginLeft: mobileMenuOpen ? 0 : undefined,
              }}
            >
              {/* SEARCH */}
              <div
                className={`serach_field-area d-flex align-items-center gap-2 ${
                  isSearchOpen ? "active" : ""
                } ms-1 ms-lg-3`}
                ref={searchRef}
                style={{
                  position: "relative",
                  width: mobileMenuOpen ? "100%" : undefined,
                }}
              >
                <div className="search_inner w-100">
                  <form action="#" onSubmit={(e) => e.preventDefault()}>
                    <div className="search_field">
                      <input
                        type="text"
                        placeholder="Search"
                        onFocus={() => setSearchOpen(true)}
                        className="w-100"
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 3,
                          padding: "4px 12px",
                          minWidth: 100,
                          minHeight: "48px",
                          fontSize: 15,
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="serach_button bg-transparent border-0 pt-1"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Image src={search} alt="" width={18} />
                    </button>
                  </form>
                </div>
              </div>
              {/* User Profile */}
              <div
                className="profile_info d-flex align-items-center ms-2"
                style={{
                  position: "relative",
                  minWidth: 72,
                  width: mobileMenuOpen ? "100%" : undefined,
                  justifyContent: mobileMenuOpen ? "flex-start" : undefined,
                }}
                tabIndex={0}
              >
                <ReactAvatar name="Mishal" size="40" round />
                <div
                  className="profile_info_iner"
                  style={{
                    position: "absolute",
                    background: "#fff",
                    boxShadow: "0 2px 12px 0 rgba(0,0,0,.10)",
                    borderRadius: 10,
                    right: 0,
                    minWidth: 180,
                    padding: 10,
                    top: 46,
                    zIndex: 1020,
                    display: "none",
                  }}
                >
                  <div className="profile_author_name">
                    <p className="mb-1 small" style={{ fontSize: 13 }}>
                      mishal@gmail.com
                    </p>
                    <h5 className="mb-2 fw-semibold" style={{ fontSize: 16 }}>
                      Mishal
                    </h5>
                  </div>
                  <div className="profile_info_details d-flex flex-column gap-1 mt-2">
                    <a
                      href="#"
                      style={{ textDecoration: "none", fontSize: 14 }}
                    >
                      My Profile
                    </a>
                    <a
                      href="#"
                      style={{ textDecoration: "none", fontSize: 14 }}
                    >
                      Settings
                    </a>
                    <form action="/api/logout" method="post">
                      <button
                        type="submit"
                        className="btn b-0 p-0 text-danger"
                        style={{
                          background: "none",
                          fontSize: 14,
                          marginTop: 6,
                          fontWeight: 500,
                        }}
                      >
                        Log Out
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
