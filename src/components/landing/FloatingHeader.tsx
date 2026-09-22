"use client";

import { useEffect, useRef, useState } from "react";

const PRIMARY = "#e11d2a";

export default function FloatingHeader() {
  const [visible, setVisible] = useState(true);
  const [capsule, setCapsule] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const diff = y - lastY.current;
      const pastThreshold = y > 40;

      setCapsule(pastThreshold);

      // Ignora micro-oscilações (bounce do navegador, trackpad impreciso).
      if (Math.abs(diff) > 4) {
        if (!pastThreshold) {
          setVisible(true); // sempre visível perto do topo
        } else if (diff > 0) {
          setVisible(true); // rolando para baixo -> mostra (cápsula)
        } else {
          setVisible(false); // rolando para cima -> esconde
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
      className="fixed inset-x-0 top-0 z-30 flex justify-center transition-transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(-120%)" }}
    >
      <div
        className={`flex items-center justify-center transition-all duration-300 ${
          capsule
            ? "mt-3 gap-6 rounded-full border border-white/10 bg-[#0a0a0a]/90 px-6 py-2.5 shadow-lg backdrop-blur"
            : "w-full gap-8 border-b border-white/10 bg-[#0a0a0a]/90 px-4 py-4 backdrop-blur"
        }`}
      >
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
