"use client";

import { useEffect, useRef, useState } from "react";

const PRIMARY = "#e11d2a";

export default function FloatingHeader() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const diff = y - lastY.current;

      // Ignora micro-oscilações (bounce do navegador, trackpad impreciso).
      if (Math.abs(diff) > 4) {
        if (diff > 0) {
          setVisible(false); // rolando para baixo -> some
        } else {
          setVisible(true); // rolando para cima -> aparece
        }
        lastY.current = y;
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur transition-transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div className="flex items-center justify-center gap-8 px-4 py-4">
        <span className="text-sm font-bold tracking-tight whitespace-nowrap">
          VITRINE<span style={{ color: PRIMARY }}>DETAIL</span>
        </span>
        <nav className="hidden gap-6 text-sm text-white/60 sm:flex">
          <a href="#recursos" className="hover:text-white">Recursos</a>
          <a href="#planos" className="hover:text-white">Planos</a>
          <a href="#faq" className="hover:text-white">Perguntas</a>
        </nav>
      </div>
    </header>
  );
}
