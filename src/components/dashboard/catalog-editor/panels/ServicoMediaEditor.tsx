"use client";

import { useState } from "react";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import AdaptiveSquareImage from "@/components/AdaptiveSquareImage";
import { inspectImageShape } from "@/lib/image-shape";
import type { MediaMode, SalesBonus, SalesFaq, ServiceDraft } from "../CatalogEditorContext";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

const MODES: { key: MediaMode; label: string; requiresGaleria?: boolean; requiresVideo?: boolean }[] = [
  { key: "single_photo", label: "Foto única" },
  { key: "before_after", label: "Antes/depois" },
  { key: "gallery", label: "Galeria", requiresGaleria: true },
  { key: "youtube", label: "Vídeo (YouTube)", requiresVideo: true },
];

export default function ServicoMediaEditor({
  service,
  permiteGaleriaFotos,
  permiteVideos,
  onClose,
  onEditSalesPage,
}: {
  service: ServiceDraft;
  permiteGaleriaFotos: boolean;
  permiteVideos: boolean;
  onClose: () => void;
  onEditSalesPage?: () => void;
}) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [uploading, setUploading] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState("");

  async function handleUpload(
    field: "image_url" | "before_image" | "after_image",
    pasta: "servicos" | "galeria",
    file: File
  ) {
    setUploading(field);
    try {
      const imageInfo = await inspectImageShape(file);
      setImageWarning(imageInfo.shape === "landscape" ? "Esta foto é horizontal. Ela será mostrada inteira, mas uma imagem quadrada ou vertical preencherá melhor o card 1:1." : "");
      const url = await uploadBusinessMedia(state.businessId, pasta, file);
      dispatch({ type: "SET_SERVICE_MEDIA_FIELD", serviceId: service.id, field, value: url });
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryUpload(file: File) {
    setUploading("gallery");
    try {
      const imageInfo = await inspectImageShape(file);
      setImageWarning(imageInfo.shape === "landscape" ? "Esta foto é horizontal. Ela será mostrada inteira, mas uma imagem quadrada ou vertical preencherá melhor o card 1:1." : "");
      const url = await uploadBusinessMedia(state.businessId, "galeria", file);
      dispatch({ type: "SET_SERVICE_GALLERY", serviceId: service.id, urls: [...service.gallery, url] });
    } finally {
      setUploading(null);
    }
  }

  function removeGalleryImage(url: string) {
    dispatch({ type: "SET_SERVICE_GALLERY", serviceId: service.id, urls: service.gallery.filter((u) => u !== url) });
  }

  async function handleSalesGalleryUpload(file: File) {
    setUploading("sales_gallery");
    try {
      const url = await uploadBusinessMedia(state.businessId, "galeria", file);
      dispatch({ type: "SET_SERVICE_SALES_GALLERY", serviceId: service.id, urls: [...service.sales_gallery, url] });
    } finally {
      setUploading(null);
    }
  }

  function removeSalesGalleryImage(url: string) {
    dispatch({ type: "SET_SERVICE_SALES_GALLERY", serviceId: service.id, urls: service.sales_gallery.filter((u) => u !== url) });
  }

  function updateBonus(index: number, field: keyof SalesBonus, value: string) {
    const bonuses = service.sales_bonuses.map((b, i) => (i === index ? { ...b, [field]: value } : b));
    dispatch({ type: "SET_SERVICE_SALES_BONUSES", serviceId: service.id, bonuses });
  }

  function addBonus() {
    dispatch({
      type: "SET_SERVICE_SALES_BONUSES",
      serviceId: service.id,
      bonuses: [...service.sales_bonuses, { title: "", description: "" }],
    });
  }

  function removeBonus(index: number) {
    dispatch({
      type: "SET_SERVICE_SALES_BONUSES",
      serviceId: service.id,
      bonuses: service.sales_bonuses.filter((_, i) => i !== index),
    });
  }

  function updateFaq(index: number, field: keyof SalesFaq, value: string) {
    const faq = service.sales_faq.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    dispatch({ type: "SET_SERVICE_SALES_FAQ", serviceId: service.id, faq });
  }

  function addFaq() {
    dispatch({
      type: "SET_SERVICE_SALES_FAQ",
      serviceId: service.id,
      faq: [...service.sales_faq, { question: "", answer: "" }],
    });
  }

  function removeFaq(index: number) {
    dispatch({
      type: "SET_SERVICE_SALES_FAQ",
      serviceId: service.id,
      faq: service.sales_faq.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{service.name}</h3>
        <button type="button" onClick={onClose} className="text-xs text-neutral-400 underline">
          Fechar
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MODES.map((m) => {
          const blocked = (m.requiresGaleria && !permiteGaleriaFotos) || (m.requiresVideo && !permiteVideos);
          return (
            <button
              key={m.key}
              type="button"
              disabled={blocked}
              onClick={() => dispatch({ type: "SET_SERVICE_MEDIA_MODE", serviceId: service.id, mode: m.key })}
              className={`rounded-md border px-2 py-2 text-center text-xs font-medium disabled:opacity-40 ${
                service.media_mode === m.key ? "border-white bg-neutral-900 text-white" : "border-neutral-800 text-neutral-500"
              }`}
            >
              {blocked ? `🔒 ${m.label}` : m.label}
            </button>
          );
        })}
      </div>

      <div className="mb-4 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2.5 text-xs leading-5 text-sky-200">
        Priorize imagens <strong>quadradas 1:1</strong> ou verticais. Fotos horizontais ficam inteiras, mas ocupam menos área útil do card.
      </div>
      {imageWarning && <p className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200">{imageWarning}</p>}

      {service.media_mode === "single_photo" && (
        <MediaUploadField
          label="Foto"
          previewUrl={service.image_url}
          uploading={uploading === "image_url"}
          onFile={(f) => handleUpload("image_url", "servicos", f)}
        />
      )}

      {service.media_mode === "before_after" && (
        <div className="grid grid-cols-2 gap-3">
          <MediaUploadField
            label="Antes"
            previewUrl={service.before_image}
            uploading={uploading === "before_image"}
            onFile={(f) => handleUpload("before_image", "servicos", f)}
          />
          <MediaUploadField
            label="Depois"
            previewUrl={service.after_image}
            uploading={uploading === "after_image"}
            onFile={(f) => handleUpload("after_image", "servicos", f)}
          />
        </div>
      )}

      {service.media_mode === "gallery" && permiteGaleriaFotos && (
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {service.gallery.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-black/70 text-[10px] text-white"
                  aria-label="Remover foto"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-[10px] text-neutral-500">
              {uploading === "gallery" ? "..." : "+ foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGalleryUpload(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {service.media_mode === "youtube" && permiteVideos && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Link do YouTube</label>
          <input
            value={service.video_url ?? ""}
            onChange={(e) =>
              dispatch({ type: "SET_SERVICE_MEDIA_FIELD", serviceId: service.id, field: "video_url", value: e.target.value })
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
      )}

      <details className="mt-5 rounded-lg border border-neutral-800" open>
        <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-semibold text-white">
          Página de vendas deste serviço
        </summary>
        <div className="space-y-4 border-t border-neutral-800 p-3">
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-white">Página de vendas ativa</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {service.sales_page_enabled
                  ? "O botão do catálogo leva para esta página."
                  : "O botão do catálogo vai direto para o WhatsApp."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={service.sales_page_enabled}
              onClick={() => dispatch({ type: "SET_SERVICE_SALES_ENABLED", serviceId: service.id, enabled: !service.sales_page_enabled })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${service.sales_page_enabled ? "bg-emerald-600" : "bg-neutral-700"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${service.sales_page_enabled ? "left-5" : "left-0.5"}`}
              />
            </button>
          </div>

          {onEditSalesPage && (
            <button
              type="button"
              onClick={onEditSalesPage}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
            >
              ✎ Editar tocando na página de vendas
            </button>
          )}

          <p className="text-xs leading-5 text-neutral-500">
            Os campos abaixo são opcionais — sem preencher, a página usa nome, descrição, foto e preço do próprio
            serviço. Prefira editar diretamente na página (botão acima) para ver o resultado em tempo real.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Headline</label>
            <input
              value={service.sales_headline}
              onChange={(e) => dispatch({ type: "SET_SERVICE_SALES_FIELD", serviceId: service.id, field: "sales_headline", value: e.target.value })}
              placeholder={service.name}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Subheadline</label>
            <textarea
              value={service.sales_subheadline}
              onChange={(e) => dispatch({ type: "SET_SERVICE_SALES_FIELD", serviceId: service.id, field: "sales_subheadline", value: e.target.value })}
              rows={2}
              placeholder="Uma frase que reforça o benefício principal"
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Vídeo do YouTube (opcional)</label>
            <input
              value={service.sales_video_url}
              onChange={(e) => dispatch({ type: "SET_SERVICE_SALES_FIELD", serviceId: service.id, field: "sales_video_url", value: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Galeria extra</label>
            <div className="flex flex-wrap gap-2">
              {service.sales_gallery.map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSalesGalleryImage(url)}
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-black/70 text-[10px] text-white"
                    aria-label="Remover foto"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-[10px] text-neutral-500">
                {uploading === "sales_gallery" ? "..." : "+ foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSalesGalleryUpload(file);
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">Bônus / o que está incluso</label>
              <button type="button" onClick={addBonus} className="text-xs font-medium text-sky-400">
                + adicionar
              </button>
            </div>
            <div className="space-y-2">
              {service.sales_bonuses.map((bonus, i) => (
                <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900 p-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <input
                      value={bonus.title}
                      onChange={(e) => updateBonus(i, "title", e.target.value)}
                      placeholder="Título do bônus"
                      className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
                    />
                    <button type="button" onClick={() => removeBonus(i)} aria-label="Remover bônus" className="text-xs text-neutral-500">
                      ✕
                    </button>
                  </div>
                  <input
                    value={bonus.description}
                    onChange={(e) => updateBonus(i, "description", e.target.value)}
                    placeholder="Descrição curta (opcional)"
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Texto do botão de WhatsApp</label>
            <input
              value={service.sales_cta_message}
              onChange={(e) => dispatch({ type: "SET_SERVICE_SALES_FIELD", serviceId: service.id, field: "sales_cta_message", value: e.target.value })}
              placeholder="Solicitar orçamento"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Aviso de urgência (opcional)</label>
            <input
              value={service.sales_urgency_text}
              onChange={(e) => dispatch({ type: "SET_SERVICE_SALES_FIELD", serviceId: service.id, field: "sales_urgency_text", value: e.target.value })}
              placeholder="Ex: Vagas limitadas esta semana"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Texto de garantia/confiança (opcional)</label>
            <textarea
              value={service.sales_guarantee_text}
              onChange={(e) => dispatch({ type: "SET_SERVICE_SALES_FIELD", serviceId: service.id, field: "sales_guarantee_text", value: e.target.value })}
              rows={2}
              placeholder="Ex: Se não ficar satisfeito, refazemos sem custo."
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">Perguntas frequentes</label>
              <button type="button" onClick={addFaq} className="text-xs font-medium text-sky-400">
                + adicionar
              </button>
            </div>
            <div className="space-y-2">
              {service.sales_faq.map((f, i) => (
                <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900 p-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <input
                      value={f.question}
                      onChange={(e) => updateFaq(i, "question", e.target.value)}
                      placeholder="Pergunta"
                      className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
                    />
                    <button type="button" onClick={() => removeFaq(i)} aria-label="Remover pergunta" className="text-xs text-neutral-500">
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={f.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    rows={2}
                    placeholder="Resposta"
                    className="w-full resize-none rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

function MediaUploadField({
  label,
  previewUrl,
  uploading,
  onFile,
}: {
  label: string;
  previewUrl: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-500">{label}</label>
      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-center">
        {previewUrl ? (
          <AdaptiveSquareImage src={previewUrl} alt={label} className="h-full w-full rounded-none" />
        ) : (
          <span className="px-2 text-[11px] text-neutral-500">{uploading ? "Enviando..." : "Toque para enviar"}</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
    </div>
  );
}
