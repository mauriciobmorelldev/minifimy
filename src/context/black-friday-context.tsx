"use client";

import { createContext, useContext, type ReactNode } from "react";

const BlackFridayContext = createContext(false);

export function BlackFridayProvider({ active, children }: { active: boolean; children: ReactNode }) {
  return <BlackFridayContext.Provider value={active}>{children}</BlackFridayContext.Provider>;
}

export function useBlackFridayCampaign() {
  return useContext(BlackFridayContext);
}
