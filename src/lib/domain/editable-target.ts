import type { SectionId } from "./catalog-sections";

export type EditableTarget =
  | { kind: "section_text"; field: "headline" | "about" | "highlights" }
  | { kind: "hero_media"; field: "logo_url" | "cover_url" }
  | { kind: "service_media"; serviceId: string }
  | { kind: "catalog_block"; instanceId: string }
  | { kind: "section_block"; sectionId: SectionId };
