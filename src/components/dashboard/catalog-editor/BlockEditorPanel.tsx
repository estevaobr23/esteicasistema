"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBlockDefinition } from "@/lib/catalog-builder/block-registry";
import { createInstanceId, type CatalogBlock, type CatalogItemRef } from "@/lib/catalog-builder/schema";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";
import BrandingVideoPanel from "./panels/BrandingVideoPanel";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import {
  AspectMiniature,
  BackgroundMiniature,
  ColumnsMiniature,
  SourceMiniature,
  VisualChoice,
} from "./CatalogMiniatures";

const MANAGE_LINKS: Partial<Record<CatalogBlock["type"], { href: string; label: string }>> = {
  servicos: { href: "/app/servicos", label: "Gerenciar serviços" },
  destaques: { href: "/app/servicos", label: "Escolher serviços em destaque" },
  antes_depois: { href: "/app/portfolio", label: "Gerenciar portfólio" },
  pacotes: { href: "/app/pacotes", label: "Gerenciar pacotes" },
  horarios: { href: "/app/horarios", label: "Gerenciar horários" },
  avaliacoes: { href: "/app/avaliacoes", label: "Gerenciar avaliações" },
  sobre: { href: "/app/configuracoes", label: "Editar dados do negócio" },
  localizacao: { href: "/app/configuracoes", label: "Editar localização" },
};

const EDITABLE_SECTION_COPY = new Set<CatalogBlock["type"]>([
  "servicos", "destaques", "antes_depois", "branding_video", "pacotes", "horarios", "avaliacoes", "sobre", "localizacao",
]);

export type CatalogSourceOption = {
  id: string;
  name: string;
  imageUrl?: string | null;
  secondaryImageUrl?: string | null;
  meta?: string;
  featured?: boolean;
};

export type ManagedSectionStatus = Partial<Record<CatalogBlock["type"], {
  ready: boolean;
  summary: string;
}>>;

function textValue(block: CatalogBlock, key: string) {
  return typeof block.content[key] === "string" ? String(block.content[key]) : "";
}

function stringArrayValue(block: CatalogBlock, key: string) {
  return Array.isArray(block.content[key])
    ? block.content[key].filter((value): value is string => typeof value === "string")
    : [];
}

export default function BlockEditorPanel({
  instanceId,
  permiteVideos,
  permiteOcultarSecoes,
  sourceOptions,
  managedStatus,
  onClose,
}: {
  instanceId: string;
  permiteVideos: boolean;
  permiteOcultarSecoes: boolean;
  sourceOptions: {
    services: CatalogSourceOption[];
    packages: CatalogSourceOption[];
    portfolio: CatalogSourceOption[];
    reviews: CatalogSourceOption[];
  };
  managedStatus: ManagedSectionStatus;
  onClose: () => void;
}) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const router = useRouter();
  const [uploading, setUploading] = useState<false | "banner" | "about-gallery" | "carousel-images">(false);
  const [uploadError, setUploadError] = useState("");
  const block = state.layout.blocks.find((item) => item.instanceId === instanceId);
  if (!block) return null;
  const definition = getBlockDefinition(block.type);
  const index = state.layout.blocks.findIndex((item) => item.instanceId === instanceId);
  const manageLink = MANAGE_LINKS[block.type];
  const hasSelectableSource = ["servicos", "destaques", "pacotes", "antes_depois", "avaliacoes"].includes(block.type);
  const selectableOptions = block.type === "servicos" || block.type === "destaques"
    ? sourceOptions.services.map((option) => {
        const draft = state.services.find((service) => service.id === option.id);
        return draft ? { ...option, imageUrl: draft.image_url || draft.before_image || option.imageUrl, secondaryImageUrl: draft.after_image || option.secondaryImageUrl } : option;
      })
    : block.type === "pacotes" ? sourceOptions.packages
      : block.type === "antes_depois" ? sourceOptions.portfolio
        : block.type === "avaliacoes" ? sourceOptions.reviews : [];
  const status = managedStatus[block.type];
  const aboutGallery = block.type === "sobre" ? stringArrayValue(block, "galleryImages") : [];
  const carouselImages = block.type === "carrossel" ? stringArrayValue(block, "images") : [];
  const carouselReviewIds = block.type === "carrossel" ? stringArrayValue(block, "reviewIds") : [];

  function updateContent(key: string, value: string) {
    dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { [key]: value } });
  }

  function remove() {
    if (!window.confirm(`Excluir a seção “${definition.label}”?`)) return;
    dispatch({ type: "REMOVE_BLOCK", instanceId });
    onClose();
  }

  async function uploadBanner(file: File) {
    setUploading("banner");
    setUploadError("");
    try {
      const url = await uploadBusinessMedia(state.businessId, "galeria", file);
      updateContent("imageUrl", url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function uploadAboutGallery(files: File[]) {
    if (files.length === 0) return;
    setUploading("about-gallery");
    setUploadError("");
    try {
      const next = [...aboutGallery];
      for (const file of files.slice(0, Math.max(0, 12 - next.length))) {
        next.push(await uploadBusinessMedia(state.businessId, "galeria", file));
      }
      dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { galleryImages: next } });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Não foi possível enviar as imagens.");
    } finally {
      setUploading(false);
    }
  }

  function removeAboutGalleryImage(index: number) {
    dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { galleryImages: aboutGallery.filter((_, itemIndex) => itemIndex !== index) } });
  }

  async function uploadCarouselImages(files: File[]) {
    if (files.length === 0) return;
    setUploading("carousel-images");
    setUploadError("");
    try {
      const next = [...carouselImages];
      for (const file of files.slice(0, Math.max(0, 12 - next.length))) {
        next.push(await uploadBusinessMedia(state.businessId, "galeria", file));
      }
      dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { images: next } });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Não foi possível enviar as imagens.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-white">{definition.label}</p>
        <p className="mt-1 text-xs leading-5 text-neutral-500">{definition.description}</p>
      </div>

      {block.type === "branding_video" && <BrandingVideoPanel permiteVideos={permiteVideos} />}

      {block.type === "sobre" && (
        <EditorGroup title="Texto sobre o negócio" description="Este texto aparece como conteúdo principal da seção.">
          <TextArea label="Apresentação" value={state.business.about} onChange={(value) => dispatch({ type: "SET_ABOUT", value })} />
          {block.variant !== "default" && (
            <div className="space-y-3 border-t border-neutral-800 pt-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-300">Galeria do espaço e da equipe</p>
                  <p className="mt-0.5 text-[10px] text-neutral-500">Até 12 fotos. A primeira ganha mais destaque.</p>
                </div>
                <label className="shrink-0 cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-950">
                  {uploading === "about-gallery" ? "Enviando..." : "+ Adicionar fotos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading === "about-gallery" || aboutGallery.length >= 12}
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (files.length > 0) void uploadAboutGallery(files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {aboutGallery.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {aboutGallery.map((url, index) => (
                    <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                      <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
                      {index === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[8px] font-semibold text-white">Capa</span>}
                      <button type="button" onClick={() => removeAboutGalleryImage(index)} aria-label={`Remover foto ${index + 1}`} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs text-white">×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-6 text-center">
                  <p className="text-xs font-medium text-neutral-300">Nenhuma foto adicionada ainda.</p>
                  <p className="mt-1 text-[10px] text-neutral-500">Mostre fachada, equipe, ferramentas ou bastidores.</p>
                </div>
              )}
              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
            </div>
          )}
        </EditorGroup>
      )}

      {EDITABLE_SECTION_COPY.has(block.type) && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div>
            <p className="text-sm font-semibold text-white">Título da seção</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">Edite a mensagem comercial sem precisar alterar os itens cadastrados.</p>
          </div>
          <Field label="Chamada curta" value={textValue(block, "eyebrow")} onChange={(value) => updateContent("eyebrow", value)} />
          <Field label="Título" value={textValue(block, "title")} onChange={(value) => updateContent("title", value)} />
          <TextArea label="Descrição" value={textValue(block, "description")} onChange={(value) => updateContent("description", value)} />
        </div>
      )}

      {block.type === "carrossel" && (
        <div className="space-y-5">
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <Field label="Chamada curta" value={textValue(block, "eyebrow")} onChange={(value) => updateContent("eyebrow", value)} />
            <Field label="Título" value={textValue(block, "title")} onChange={(value) => updateContent("title", value)} />
            <TextArea label="Descrição" value={textValue(block, "description")} onChange={(value) => updateContent("description", value)} />
          </div>

          <EditorGroup title="Conteúdo do carrossel" description="Escolha entre imagens próprias ou avaliações já cadastradas.">
            <div className="grid grid-cols-2 gap-2">
              {([{"value":"images","label":"Imagens","description":"Fotos e resultados"},{"value":"reviews","label":"Depoimentos","description":"Avaliações de clientes"}] as const).map((option) => {
                const selected = (textValue(block, "mode") || "images") === option.value;
                return <button key={option.value} type="button" onClick={() => updateContent("mode", option.value)} className={`rounded-xl border p-3 text-left ${selected ? "border-white bg-white/[0.08]" : "border-neutral-800 bg-neutral-950"}`}><span className="block text-xs font-semibold text-white">{option.label}</span><span className="mt-1 block text-[10px] text-neutral-500">{option.description}</span></button>;
              })}
            </div>

            {(textValue(block, "mode") || "images") === "images" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-neutral-500">Até 12 imagens. Use fotos quadradas ou verticais.</p>
                  <label className="shrink-0 cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-950">{uploading === "carousel-images" ? "Enviando..." : "+ Imagens"}<input type="file" accept="image/*" multiple disabled={uploading === "carousel-images" || carouselImages.length >= 12} className="hidden" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) void uploadCarouselImages(files); event.target.value = ""; }} /></label>
                </div>
                {carouselImages.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{carouselImages.map((url, imageIndex) => <div key={`${url}-${imageIndex}`} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"><span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} /><button type="button" aria-label={`Remover imagem ${imageIndex + 1}`} onClick={() => dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { images: carouselImages.filter((_, index) => index !== imageIndex) } })} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs text-white">×</button></div>)}</div> : <p className="rounded-xl border border-dashed border-neutral-700 px-4 py-6 text-center text-xs text-neutral-500">Envie as imagens que devem alternar automaticamente.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {sourceOptions.reviews.length ? sourceOptions.reviews.map((review) => {
                  const selected = carouselReviewIds.includes(review.id);
                  return <button key={review.id} type="button" onClick={() => dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { reviewIds: selected ? carouselReviewIds.filter((id) => id !== review.id) : [...carouselReviewIds, review.id] } })} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selected ? "border-emerald-500/50 bg-emerald-500/10" : "border-neutral-800 bg-neutral-950"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${selected ? "border-emerald-400 bg-emerald-400 text-neutral-950" : "border-neutral-600 text-transparent"}`}>✓</span><span className="min-w-0"><strong className="block truncate text-xs text-white">{review.name}</strong><span className="mt-0.5 block text-[10px] text-neutral-500">{review.meta}</span></span></button>;
                }) : <p className="rounded-xl border border-dashed border-neutral-700 px-4 py-6 text-center text-xs text-neutral-500">Cadastre avaliações para usar este modo.</p>}
              </div>
            )}
            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          </EditorGroup>

          <EditorGroup title="Movimento" description="A rotação pausa fora da tela, no toque e quando o visitante passa o mouse.">
            <div className="grid grid-cols-2 gap-2">
              {definition.variants.map((variant) => <button key={variant.id} type="button" onClick={() => dispatch({ type: "SET_BLOCK_VARIANT", instanceId, variant: variant.id })} className={`rounded-xl border p-3 text-left ${block.variant === variant.id ? "border-white bg-white/[0.08]" : "border-neutral-800 bg-neutral-950"}`}><span className="mb-3 flex h-10 items-center overflow-hidden rounded-lg bg-neutral-900 px-2"><i className={`h-5 rounded bg-white/25 ${variant.id === "marquee" ? "w-3/4 translate-x-3" : "w-full"}`} /></span><span className="text-xs font-semibold text-white">{variant.label}</span></button>)}
            </div>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3"><span><span className="block text-xs font-medium text-neutral-300">Tempo de troca</span><span className="text-[10px] text-neutral-500">Entre 2 e 15 segundos</span></span><span className="flex items-center gap-2"><input aria-label="Segundos do autoplay" type="number" min={2} max={15} value={Math.max(2, Math.min(15, Number(block.content.autoplaySeconds) || 5))} onChange={(event) => dispatch({ type: "UPDATE_BLOCK_CONTENT", instanceId, content: { autoplaySeconds: Math.max(2, Math.min(15, Number(event.target.value) || 5)) } })} className="h-9 w-16 rounded-lg border border-neutral-700 bg-neutral-900 text-center text-sm text-white" /><span className="text-xs text-neutral-500">s</span></span></label>
          </EditorGroup>
        </div>
      )}

      {["banner", "video", "text", "cta"].includes(block.type) && (
        <div className="space-y-3">
          {block.type !== "cta" && block.type !== "video" && (
            <Field label="Chamada curta" value={textValue(block, "eyebrow")} onChange={(value) => updateContent("eyebrow", value)} />
          )}
          <Field label="Título" value={textValue(block, "title")} onChange={(value) => updateContent("title", value)} />
          <TextArea
            label={block.type === "text" ? "Texto" : "Descrição"}
            value={textValue(block, block.type === "text" ? "body" : "description")}
            onChange={(value) => updateContent(block.type === "text" ? "body" : "description", value)}
          />
          {block.type === "banner" && (
            <div className="space-y-2">
              <label className="block cursor-pointer rounded-lg border border-dashed border-neutral-700 bg-neutral-900 p-3 text-center text-xs text-neutral-400">
                {uploading === "banner" ? "Enviando imagem..." : "Enviar imagem do banner"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading === "banner"} onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadBanner(file);
                }} />
              </label>
              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              <Field label="Ou cole a URL da imagem" value={textValue(block, "imageUrl")} onChange={(value) => updateContent("imageUrl", value)} placeholder="https://..." />
            </div>
          )}
          {block.type === "video" && (
            <>
              <Field label="Link do YouTube" value={textValue(block, "videoUrl")} onChange={(value) => updateContent("videoUrl", value)} placeholder="https://youtube.com/watch?v=..." />
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-300">Proporção do vídeo</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "16:9", label: "Horizontal" },
                    { value: "9:16", label: "Vertical" },
                    { value: "1:1", label: "Quadrado" },
                  ] as const).map((option) => (
                    <VisualChoice key={option.value} label={option.label} selected={(textValue(block, "aspectRatio") || "16:9") === option.value} onClick={() => updateContent("aspectRatio", option.value)}>
                      <AspectMiniature ratio={option.value} />
                    </VisualChoice>
                  ))}
                </div>
              </div>
            </>
          )}
          {(block.type === "banner" || block.type === "text") && (
            <>
              <Field label="Texto do botão" value={textValue(block, "buttonLabel")} onChange={(value) => updateContent("buttonLabel", value)} />
              <Field label="Destino do botão" value={textValue(block, "buttonUrl")} onChange={(value) => updateContent("buttonUrl", value)} placeholder="#servicos ou https://..." />
            </>
          )}
          {block.type === "cta" && (
            <>
              <Field label="Texto do botão" value={textValue(block, "buttonLabel")} onChange={(value) => updateContent("buttonLabel", value)} />
              <TextArea label="Mensagem do WhatsApp" value={textValue(block, "message")} onChange={(value) => updateContent("message", value)} />
            </>
          )}
        </div>
      )}

      {manageLink && !hasSelectableSource && (
        <div className={`rounded-2xl border p-4 ${status?.ready ? "border-emerald-900/60 bg-emerald-950/20" : "border-amber-900/60 bg-amber-950/20"}`}>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${status?.ready ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
              {status?.ready ? "✓" : "!"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{status?.ready ? "Conteúdo pronto" : "Esta seção precisa de conteúdo"}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">{status?.summary ?? "Revise os dados que alimentam esta seção."}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href={manageLink.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-xs font-medium text-white">
              {manageLink.label}<span>↗</span>
            </Link>
            <button type="button" onClick={() => router.refresh()} className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-xs font-medium text-neutral-300">Atualizar conteúdo</button>
          </div>
        </div>
      )}

      {hasSelectableSource && (
        <DataSourceEditor
          block={block}
          options={selectableOptions}
          showMediaChoice={block.type === "servicos" || block.type === "destaques"}
          manageLink={manageLink}
          onRefresh={() => router.refresh()}
          onChange={(dataSource) => dispatch({ type: "UPDATE_BLOCK_DATA_SOURCE", instanceId, dataSource })}
        />
      )}

      {(block.type === "destaques" || block.type === "pacotes") && (
        <EditorGroup title="Layout dos cards" description="No celular sempre empilha. No computador, escolha entre um card largo em destaque ou dois lado a lado.">
          <div className="grid grid-cols-2 gap-2">
            <VisualChoice
              label="Coluna única"
              description="Card largo, um por linha"
              selected={block.responsive.columns.desktop === 1}
              onClick={() => {
                dispatch({
                  type: "UPDATE_BLOCK_RESPONSIVE",
                  instanceId,
                  responsive: { columns: { mobile: 1, tablet: 1, desktop: 1 } },
                });
                if (block.type === "destaques" && block.variant !== "featured") {
                  dispatch({ type: "SET_BLOCK_VARIANT", instanceId, variant: "featured" });
                }
              }}
            >
              <ColumnsMiniature columns={1} />
            </VisualChoice>
            <VisualChoice
              label="Colunas duplas"
              description="2 cards lado a lado"
              selected={block.responsive.columns.desktop === 2}
              onClick={() => {
                dispatch({
                  type: "UPDATE_BLOCK_RESPONSIVE",
                  instanceId,
                  responsive: { columns: { mobile: 1, tablet: 2, desktop: 2 } },
                });
                if (block.type === "destaques" && block.variant === "featured") {
                  dispatch({ type: "SET_BLOCK_VARIANT", instanceId, variant: "cards" });
                }
              }}
            >
              <ColumnsMiniature columns={2} />
            </VisualChoice>
          </div>
        </EditorGroup>
      )}

      <EditorGroup title="Aparência da seção" description="Personalize as cores sem alterar a estrutura segura do catálogo.">
        <OptionTitle>Cor de destaque</OptionTitle>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "UPDATE_BLOCK_STYLE", instanceId, style: { accentColor: undefined } })}
            className={`rounded-xl border p-3 text-left transition ${!block.style.accentColor ? "border-white bg-white/[0.08]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}
          >
            <span className="block h-9 rounded-lg border border-white/10" style={{ backgroundColor: state.business.primary_color }} />
            <span className="mt-2 block text-xs font-semibold text-white">Cor da marca</span>
            <span className="mt-0.5 block text-[10px] text-neutral-500">Acompanha o tema</span>
          </button>
          <label className={`cursor-pointer rounded-xl border p-3 text-left transition ${block.style.accentColor ? "border-white bg-white/[0.08]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
            <span className="flex h-9 items-center justify-center rounded-lg border border-white/10" style={{ backgroundColor: block.style.accentColor || state.business.primary_color }}>
              <input
                type="color"
                value={block.style.accentColor || state.business.primary_color}
                onChange={(event) => dispatch({ type: "UPDATE_BLOCK_STYLE", instanceId, style: { accentColor: event.target.value } })}
                className="h-7 w-10 cursor-pointer bg-transparent"
                aria-label="Cor de destaque personalizada"
              />
            </span>
            <span className="mt-2 block text-xs font-semibold text-white">Personalizada</span>
            <span className="mt-0.5 block text-[10px] text-neutral-500">Somente nesta seção</span>
          </label>
        </div>

        <OptionTitle>Fundo</OptionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {([
            { value: "auto", label: "Automático" },
            { value: "base", label: "Principal" },
            { value: "alternate", label: "Alternativo" },
            { value: "primary", label: "Marca" },
            { value: "custom", label: "Personalizado" },
          ] as const).map((option) => (
            <VisualChoice key={option.value} label={option.label} selected={block.style.background === option.value} onClick={() => dispatch({ type: "UPDATE_BLOCK_STYLE", instanceId, style: { background: option.value as CatalogBlock["style"]["background"] } })}>
              <BackgroundMiniature background={option.value} primaryColor={state.business.primary_color} />
            </VisualChoice>
          ))}
        </div>
        {block.style.background === "custom" && (
          <label className="mt-3 flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
            <input type="color" value={block.style.backgroundColor || "#111111"} onChange={(event) => dispatch({ type: "UPDATE_BLOCK_STYLE", instanceId, style: { backgroundColor: event.target.value } })} className="h-8 w-8 bg-transparent" />
            <span className="text-sm text-neutral-400">Cor de fundo personalizada</span>
          </label>
        )}
      </EditorGroup>

      <div className="space-y-2">
        <Toggle label="Mostrar seção" description="Exibe este bloco no catálogo publicado." checked={block.visible} disabled={!permiteOcultarSecoes} onChange={(visible) => dispatch({ type: "TOGGLE_BLOCK", instanceId, visible })} />
        <Toggle label="Ocultar no celular" description="Mantém a seção apenas em telas maiores." checked={block.responsive.hideOnMobile} disabled={!permiteOcultarSecoes} onChange={(hideOnMobile) => dispatch({ type: "UPDATE_BLOCK_RESPONSIVE", instanceId, responsive: { hideOnMobile } })} />
        <Toggle label="Ocultar no desktop" description="Mostra a seção somente em dispositivos menores." checked={block.responsive.hideOnDesktop} disabled={!permiteOcultarSecoes} onChange={(hideOnDesktop) => dispatch({ type: "UPDATE_BLOCK_RESPONSIVE", instanceId, responsive: { hideOnDesktop } })} />
        {!permiteOcultarSecoes && <p className="text-[11px] text-neutral-600">Visibilidade por dispositivo está disponível no plano Profissional.</p>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={index === 0} onClick={() => dispatch({ type: "MOVE_BLOCK", instanceId, direction: -1 })} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-300 disabled:opacity-30">↑ Mover</button>
        <button type="button" disabled={index === state.layout.blocks.length - 1} onClick={() => dispatch({ type: "MOVE_BLOCK", instanceId, direction: 1 })} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-300 disabled:opacity-30">↓ Mover</button>
        <button type="button" onClick={() => dispatch({ type: "DUPLICATE_BLOCK", instanceId })} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-300">Duplicar</button>
        <button type="button" onClick={remove} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400">Excluir</button>
      </div>
    </div>
  );
}

function DataSourceEditor({
  block,
  options,
  showMediaChoice,
  manageLink,
  onRefresh,
  onChange,
}: {
  block: CatalogBlock;
  options: CatalogSourceOption[];
  showMediaChoice: boolean;
  manageLink?: { href: string; label: string };
  onRefresh: () => void;
  onChange: (dataSource: Partial<CatalogBlock["dataSource"]>) => void;
}) {
  const names = new Map(options.map((item) => [item.id, item.name]));
  const selectedSourceIds = new Set(block.dataSource.items.map((item) => item.sourceId));
  const automaticOptions = block.dataSource.mode === "featured" ? options.filter((item) => item.featured) : options;
  const visibleCount = block.dataSource.mode === "selected" ? Math.min(block.dataSource.items.length, block.dataSource.limit) : Math.min(automaticOptions.length, block.dataSource.limit);

  function switchToManual() {
    const initial = automaticOptions.slice(0, block.dataSource.limit).map((item) => ({
      instanceId: createInstanceId("item"),
      sourceId: item.id,
    }));
    onChange({ mode: "selected", items: initial });
  }
  function toggleSource(sourceId: string) {
    if (selectedSourceIds.has(sourceId)) {
      onChange({ items: block.dataSource.items.filter((item) => item.sourceId !== sourceId) });
      return;
    }
    const items = [...block.dataSource.items, { instanceId: createInstanceId("item"), sourceId }];
    onChange({ items, limit: Math.max(block.dataSource.limit, items.length) });
  }
  function updateItem(instanceId: string, patch: Partial<CatalogItemRef>) {
    onChange({ items: block.dataSource.items.map((item) => item.instanceId === instanceId ? { ...item, ...patch } : item) });
  }
  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= block.dataSource.items.length) return;
    const items = [...block.dataSource.items];
    [items[index], items[target]] = [items[target], items[index]];
    onChange({ items });
  }
  return (
    <EditorGroup title="Conteúdo exibido" description="Escolha de onde virão os itens desta seção.">
      <div className="grid grid-cols-3 gap-2">
        {([
          { value: "all", label: "Todos", description: "Itens ativos" },
          { value: "featured", label: "Destaques", description: "Mais procurados" },
          { value: "selected", label: "Manual", description: "Você escolhe" },
        ] as const).map((option) => (
          <VisualChoice key={option.value} label={option.label} description={option.description} selected={block.dataSource.mode === option.value} onClick={() => onChange({ mode: option.value })}>
            <SourceMiniature mode={option.value} />
          </VisualChoice>
        ))}
      </div>

      {options.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-800/70 bg-amber-950/20 p-5 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-lg text-amber-300">+</span>
          <p className="mt-3 text-sm font-semibold text-white">Nenhum item disponível</p>
          <p className="mt-1 text-xs leading-5 text-neutral-400">Cadastre o primeiro item e volte para escolher o que aparecerá nesta seção.</p>
          {manageLink && <div className="mt-4 flex justify-center gap-2"><Link href={manageLink.href} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-neutral-950">{manageLink.label} ↗</Link><button type="button" onClick={onRefresh} className="rounded-lg border border-neutral-700 px-4 py-2.5 text-xs font-semibold text-white">Atualizar lista</button></div>}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-neutral-300">Itens disponíveis</p>
              <p className="mt-0.5 text-[10px] text-neutral-500">{visibleCount} de {options.length} serão exibidos</p>
            </div>
            {block.dataSource.mode !== "selected" ? (
              <button type="button" onClick={switchToManual} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-semibold text-white">Escolher um por um</button>
            ) : manageLink ? (
              <span className="flex items-center gap-3"><button type="button" onClick={onRefresh} className="text-xs font-medium text-neutral-400 underline underline-offset-2">Atualizar</button><Link href={manageLink.href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-neutral-400 underline underline-offset-2">Cadastrar mais ↗</Link></span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const included = block.dataSource.mode === "all"
                ? options.indexOf(option) < block.dataSource.limit
                : block.dataSource.mode === "featured"
                  ? option.featured === true && automaticOptions.indexOf(option) < block.dataSource.limit
                  : selectedSourceIds.has(option.id);
              const card = (
                <>
                  <SourceOptionMedia option={option} />
                  <span className="block p-2.5">
                    <span className="line-clamp-2 block text-xs font-semibold leading-4 text-white">{option.name}</span>
                    {option.meta && <span className="mt-1 block truncate text-[10px] text-neutral-500">{option.meta}</span>}
                  </span>
                  <span className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${included ? "border-white bg-white text-neutral-950" : "border-neutral-600 bg-neutral-950/80 text-transparent"}`}>✓</span>
                  {block.dataSource.mode !== "selected" && included && <span className="absolute bottom-2 right-2 rounded-full bg-neutral-950/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-neutral-300">Automático</span>}
                </>
              );
              return block.dataSource.mode === "selected" ? (
                <button key={option.id} type="button" aria-pressed={included} onClick={() => toggleSource(option.id)} className={`relative overflow-hidden rounded-xl border text-left transition ${included ? "border-white bg-white/[0.06]" : "border-neutral-800 bg-neutral-950 opacity-70 hover:opacity-100"}`}>
                  {card}
                </button>
              ) : (
                <div key={option.id} className={`relative overflow-hidden rounded-xl border bg-neutral-950 text-left ${included ? "border-neutral-700" : "border-neutral-800 opacity-40"}`}>
                  {card}
                </div>
              );
            })}
          </div>
        </>
      )}

      {block.dataSource.mode === "selected" && block.dataSource.items.length > 0 && <>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs font-semibold text-neutral-300">Ordem de exibição</p>
          <span className="text-[10px] text-neutral-500">{block.dataSource.items.length} selecionado(s)</span>
        </div>
        <div className="mt-3 space-y-2">
          {block.dataSource.items.map((item, index) => (
            <div key={item.instanceId} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-medium text-neutral-300">{names.get(item.sourceId) ?? "Item removido"}</span><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => moveItem(index, -1)} className="px-1.5 text-xs text-neutral-400 disabled:opacity-25">↑</button><button type="button" disabled={index === block.dataSource.items.length - 1} onClick={() => moveItem(index, 1)} className="px-1.5 text-xs text-neutral-400 disabled:opacity-25">↓</button><button type="button" onClick={() => { const items = [...block.dataSource.items, { ...item, instanceId: createInstanceId("item") }]; onChange({ items, limit: Math.max(block.dataSource.limit, items.length) }); }} className="rounded border border-neutral-700 px-2 py-1 text-[10px] text-white">Duplicar exibição</button><button type="button" onClick={() => onChange({ items: block.dataSource.items.filter((entry) => entry.instanceId !== item.instanceId) })} className="px-2 text-xs text-red-400">×</button></div></div>
              {showMediaChoice && <select value={item.mediaMode ?? "auto"} onChange={(event) => updateItem(item.instanceId, { mediaMode: event.target.value })} className="mt-2 w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-300"><option value="auto">Mídia padrão do serviço</option><option value="single_photo">Foto única</option><option value="before_after">Antes/depois</option><option value="gallery">Galeria</option><option value="youtube">Vídeo</option></select>}
            </div>
          ))}
        </div>
      </>}
      {options.length > 0 && block.dataSource.mode !== "selected" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div><p className="text-xs font-medium text-neutral-300">Quantidade máxima</p><p className="text-[10px] text-neutral-500">Limite desta seção</p></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onChange({ limit: Math.max(1, block.dataSource.limit - 1) })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-white">−</button>
            <input aria-label="Limite de itens" type="number" min={1} max={30} value={block.dataSource.limit} onChange={(event) => onChange({ limit: Math.max(1, Math.min(30, Number(event.target.value))) })} className="h-8 w-12 rounded-lg border border-neutral-700 bg-neutral-900 text-center text-sm font-semibold text-white" />
            <button type="button" onClick={() => onChange({ limit: Math.min(30, block.dataSource.limit + 1) })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-white">+</button>
          </div>
        </div>
      )}
    </EditorGroup>
  );
}

function SourceOptionMedia({ option }: { option: CatalogSourceOption }) {
  if (option.imageUrl && option.secondaryImageUrl) {
    return (
      <span className="grid aspect-[16/9] grid-cols-2 gap-px bg-neutral-800">
        <span className="bg-cover bg-center" style={{ backgroundImage: `url(${option.imageUrl})` }} />
        <span className="bg-cover bg-center" style={{ backgroundImage: `url(${option.secondaryImageUrl})` }} />
      </span>
    );
  }
  if (option.imageUrl) return <span className="block aspect-[16/9] bg-neutral-900 bg-cover bg-center" style={{ backgroundImage: `url(${option.imageUrl})` }} />;
  return <span className="flex aspect-[16/9] items-center justify-center bg-[linear-gradient(135deg,#171717,#0a0a0a)] text-lg text-neutral-700">▦</span>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none" /></label>;
}

function EditorGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/45 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function OptionTitle({ children }: { children: ReactNode }) {
  return <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">{children}</p>;
}

function Toggle({ label, description, checked, onChange, disabled }: { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-neutral-700"}`}>
      <span>
        <span className="block text-sm font-medium text-neutral-200">{label}</span>
        {description && <span className="mt-0.5 block text-[11px] text-neutral-500">{description}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald-500" : "bg-neutral-700"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
    </label>
  );
}
