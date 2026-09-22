"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const BottomNavVisibilityContext = createContext<{
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
} | null>(null);

export function BottomNavVisibilityProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <BottomNavVisibilityContext.Provider value={{ hidden, setHidden }}>{children}</BottomNavVisibilityContext.Provider>
  );
}

export function useBottomNavHidden(): boolean {
  const ctx = useContext(BottomNavVisibilityContext);
  return ctx?.hidden ?? false;
}

export function useSetBottomNavHidden(): (hidden: boolean) => void {
  const ctx = useContext(BottomNavVisibilityContext);
  return ctx?.setHidden ?? (() => {});
}
