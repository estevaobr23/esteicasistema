"use client";

import { useState } from "react";
import { useCatalogEditorState } from "../CatalogEditorContext";
import ServicoMediaEditor from "./ServicoMediaEditor";

const MODE_LABELS: Record<string, string> = {
  single_photo: "Foto única",
  before_after: "Antes/depois",
  gallery: "Galeria",
  youtube: "Vídeo",
};

export default function ServicosPanel({
  permiteGaleriaFotos,
  permiteVideos,
}: {
  permiteGaleriaFotos: boolean;
  permiteVideos: boolean;
}) {
  const state = useCatalogEditorState();
  const [openId, setOpenId] = useState<string | null>(null);

  if (state.services.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Cadastre serviços em &ldquo;Serviços&rdquo; para configurar a exibição deles aqui.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {state.services.map((service) => (
        <div key={service.id}>
          {openId === service.id ? (
            <ServicoMediaEditor
              service={service}
              permiteGaleriaFotos={permiteGaleriaFotos}
              permiteVideos={permiteVideos}
              onClose={() => setOpenId(null)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setOpenId(service.id)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-left"
            >
              <span className="text-sm text-white">{service.name}</span>
              <span className="text-xs text-neutral-500">{MODE_LABELS[service.media_mode]}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
