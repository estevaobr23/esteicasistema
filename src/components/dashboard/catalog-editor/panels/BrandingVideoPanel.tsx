"use client";

import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

export default function BrandingVideoPanel({ permiteVideos }: { permiteVideos: boolean }) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();

  const sectionVisible = state.sectionsConfig.find((s) => s.id === "branding_video")?.visible ?? false;

  return (
    <div className="space-y-4">
      {!permiteVideos && (
        <p className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
          🔒 Vídeo de apresentação está disponível no plano Profissional.
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Link do YouTube</label>
        <input
          value={state.business.branding_video_url}
          onChange={(e) => dispatch({ type: "SET_BRANDING_VIDEO", url: e.target.value })}
          disabled={!permiteVideos}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none disabled:opacity-50"
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          Um vídeo curto de apresentação do seu negócio, exibido no catálogo.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={sectionVisible}
          disabled={!permiteVideos}
          onChange={(e) => dispatch({ type: "TOGGLE_SECTION", id: "branding_video", visible: e.target.checked })}
          className="h-4 w-4 accent-white disabled:opacity-30"
        />
        Mostrar esta seção no catálogo
      </label>
    </div>
  );
}
