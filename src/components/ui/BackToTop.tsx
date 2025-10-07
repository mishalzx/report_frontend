// components/BackToTop.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY >= 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div id="back-top" style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="btn_1"
      >
        ↑ Top
      </a>
    </div>
  );
}
