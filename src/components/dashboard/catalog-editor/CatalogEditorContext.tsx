"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { editorReducer, type EditorAction, type EditorState } from "./editor-state";

export type {
  BusinessDraft,
  EditorAction,
  EditorState,
  MediaMode,
  ServiceDraft,
} from "./editor-state";
export { buildInitialState } from "./editor-state";

const CatalogEditorStateContext = createContext<EditorState | null>(null);
const CatalogEditorDispatchContext = createContext<React.Dispatch<EditorAction> | null>(null);

export function CatalogEditorProvider({
  initialState,
  children,
}: {
  initialState: EditorState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <CatalogEditorStateContext.Provider value={state}>
      <CatalogEditorDispatchContext.Provider value={dispatch}>{children}</CatalogEditorDispatchContext.Provider>
    </CatalogEditorStateContext.Provider>
  );
}

export function useCatalogEditorState(): EditorState {
  const ctx = useContext(CatalogEditorStateContext);
  if (!ctx) throw new Error("useCatalogEditorState deve ser usado dentro de CatalogEditorProvider");
  return ctx;
}

export function useCatalogEditorDispatch(): React.Dispatch<EditorAction> {
  const ctx = useContext(CatalogEditorDispatchContext);
  if (!ctx) throw new Error("useCatalogEditorDispatch deve ser usado dentro de CatalogEditorProvider");
  return ctx;
}
