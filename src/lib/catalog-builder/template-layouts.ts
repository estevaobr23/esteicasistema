import type { TemplateId } from "@/lib/domain/catalog-templates";
import { createDefaultBlock, type CatalogBlock, type CatalogLayout } from "./schema";

function block(type: CatalogBlock["type"], patch: Partial<CatalogBlock> = {}): CatalogBlock {
  const base = createDefaultBlock(type, `template-${type}`);
  return {
    ...base,
    ...patch,
    style: { ...base.style, ...patch.style },
    responsive: { ...base.responsive, ...patch.responsive },
    content: { ...base.content, ...patch.content },
    dataSource: { ...base.dataSource, ...patch.dataSource },
  };
}

export function createTemplateLayout(templateId: TemplateId): CatalogLayout {
  if (templateId === "claro_premium") {
    return {
      schemaVersion: 1,
      templateId,
      blocks: [
        block("destaques", { variant: "cards", dataSource: { ...createDefaultBlock("destaques").dataSource, mode: "all", limit: 12 }, responsive: { ...createDefaultBlock("destaques").responsive, columns: { mobile: 1, tablet: 3, desktop: 3 } } }),
        block("antes_depois", { variant: "featured", dataSource: { ...createDefaultBlock("antes_depois").dataSource, mode: "featured", limit: 2 }, responsive: { ...createDefaultBlock("antes_depois").responsive, columns: { mobile: 1, tablet: 2, desktop: 2 } } }),
        block("pacotes", { variant: "comparison", responsive: { ...createDefaultBlock("pacotes").responsive, columns: { mobile: 1, tablet: 2, desktop: 2 } } }),
        block("text", { variant: "card", content: { eyebrow: "Processo transparente", title: "Você sabe o que será feito antes de agendar", body: "Apresentamos cada etapa, o tempo estimado e o resultado esperado. Assim você escolhe com segurança e sem surpresas.", buttonLabel: "", buttonUrl: "" }, style: { ...createDefaultBlock("text").style, width: "compact", background: "alternate" } }),
        block("avaliacoes", { variant: "carousel" }),
        block("sobre", { variant: "split", style: { ...createDefaultBlock("sobre").style, width: "compact" } }),
        block("horarios", { variant: "chips", style: { ...createDefaultBlock("horarios").style, width: "compact" } }),
        block("localizacao", { variant: "contact" }),
        block("cta", { variant: "compact" }),
      ],
    };
  }

  if (templateId === "performance_gt") {
    return {
      schemaVersion: 1,
      templateId,
      blocks: [
        block("destaques", { variant: "featured", dataSource: { ...createDefaultBlock("destaques").dataSource, mode: "all", limit: 12 }, responsive: { ...createDefaultBlock("destaques").responsive, columns: { mobile: 1, tablet: 2, desktop: 3 } } }),
        block("antes_depois", { variant: "featured", dataSource: { ...createDefaultBlock("antes_depois").dataSource, mode: "featured", limit: 2 } }),
        block("pacotes", { variant: "cards", responsive: { ...createDefaultBlock("pacotes").responsive, columns: { mobile: 1, tablet: 2, desktop: 2 } } }),
        block("branding_video", { variant: "wide", content: { eyebrow: "Técnica em movimento", title: "Veja o processo", description: "Precisão, iluminação e cuidado em cada etapa." } }),
        block("text", { variant: "split", content: { eyebrow: "Por que escolher", title: "Resultado forte, decisão simples", body: "Compare os serviços, veja resultados reais e fale diretamente com a equipe para confirmar o melhor tratamento para o veículo.", buttonLabel: "", buttonUrl: "" }, style: { ...createDefaultBlock("text").style, background: "alternate" } }),
        block("avaliacoes", { variant: "grid" }),
        block("horarios", { variant: "chips", style: { ...createDefaultBlock("horarios").style, width: "compact" } }),
        block("localizacao", { variant: "contact" }),
        block("cta", { variant: "full" }),
      ],
    };
  }

  return {
    schemaVersion: 1,
    templateId: "classico_dark",
    blocks: [
      block("destaques", { variant: "cards", dataSource: { ...createDefaultBlock("destaques").dataSource, mode: "all", limit: 12 }, responsive: { ...createDefaultBlock("destaques").responsive, columns: { mobile: 1, tablet: 2, desktop: 3 } } }),
      block("antes_depois", { variant: "featured", dataSource: { ...createDefaultBlock("antes_depois").dataSource, mode: "featured", limit: 2 }, responsive: { ...createDefaultBlock("antes_depois").responsive, columns: { mobile: 1, tablet: 2, desktop: 2 } } }),
      block("text", { variant: "card", content: { eyebrow: "Escolha com segurança", title: "Tudo explicado antes do serviço", body: "Veja o que está incluído, compare os formatos e peça uma recomendação para o seu veículo.", buttonLabel: "", buttonUrl: "" }, style: { ...createDefaultBlock("text").style, width: "compact", background: "alternate" } }),
      block("pacotes", { variant: "cards", responsive: { ...createDefaultBlock("pacotes").responsive, columns: { mobile: 1, tablet: 2, desktop: 2 } } }),
      block("branding_video", { variant: "wide" }),
      block("avaliacoes", { variant: "carousel" }),
      block("sobre", { variant: "default", style: { ...createDefaultBlock("sobre").style, width: "compact" } }),
      block("horarios", { variant: "chips", style: { ...createDefaultBlock("horarios").style, width: "compact" } }),
      block("localizacao", { variant: "default" }),
      block("cta", { variant: "full" }),
    ],
  };
}
