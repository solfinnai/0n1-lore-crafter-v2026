"use client"

import { createContext, useContext } from "react"

// Lets deeply nested components (e.g. the AI assistant card inside each wizard
// step) open the trait-meanings panel owned by MultiStepForm without prop
// drilling. Null outside the wizard - consumers must handle that.
export const TraitsPanelContext = createContext<{ openTraitsPanel: () => void } | null>(null)

export function useTraitsPanel() {
  return useContext(TraitsPanelContext)
}
