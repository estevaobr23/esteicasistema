"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBottomNavHidden } from "./BottomNavVisibilityProvider";

type IconName =
  | "home"
  | "wrench"
  | "box"
  | "image"
  | "clock"
  | "star"
  | "chart"
  | "palette"
  | "settings";

type NavItem = {
  href: string;
  label: string;
  navLabel: string;
  icon: IconName;
};

const ICONS: Record<IconName, React.ReactNode> = {
  home: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
    />
  ),
  wrench: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.5 6.5a4 4 0 0 1-5.4 5.4L4 17l3 3 5.1-5.1a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z"
    />
  ),
  box: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Zm0 0V16L12 20.5m0-8V20.5m8.5-12.5V16L12 20.5"
    />
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="10" r="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 17 4.5-4.5a2 2 0 0 1 2.8 0L15 15.2l1.2-1.2a2 2 0 0 1 2.8 0L21 16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
    </>
  ),
  star: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z"
    />
  ),
  chart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20V10m6.5 10V4M17 20v-6.5M4 20h16"
    />
  ),
  palette: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8h2.1a3.3 3.3 0 0 0 3.3-3.3c0-4.2-3.9-7.7-8-7.7Zm-4.8 6.3a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm3-3.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm4.2.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm2.8 3.3a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
    />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m13.1-6.1-1.4 1.4M6.8 17.2l-1.4 1.4m13.6 0-1.4-1.4M6.8 6.8 5.4 5.4"
      />
    </>
  ),
};

function NavIcon({ name, active }: { name: IconName; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      className="h-5 w-5"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const hidden = useBottomNavHidden();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function updateFades() {
      if (!el) return;
      setShowLeftFade(el.scrollLeft > 4);
      setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    window.addEventListener("resize", updateFades);
    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, [items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    const active = el?.querySelector<HTMLAnchorElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  if (hidden) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-900 bg-neutral-950/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative">
        {showLeftFade && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-neutral-950 to-transparent" />
        )}
        {showRightFade && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-neutral-950 to-transparent" />
        )}

        <div ref={scrollerRef} className="flex overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className={`flex w-[4.5rem] shrink-0 flex-col items-center gap-1 py-2.5 text-center text-[10.5px] font-medium ${
                  active ? "text-white" : "text-neutral-500"
                }`}
              >
                <NavIcon name={item.icon} active={active} />
                <span className="leading-none">{item.navLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
