"use client";

import Script from "next/script";
import type { Database } from "@/lib/supabase/types";
import BeforeAfterSlider from "./BeforeAfterSlider";
import ServiceGallery from "./ServiceGallery";
import YoutubeEmbed from "./YoutubeEmbed";

type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

function processInstagram() {
  const api = (window as unknown as { instgrm?: { Embeds?: { process?: () => void } } }).instgrm;
  api?.Embeds?.process?.();
}

export default function PortfolioMedia({ item }: { item: PortfolioItem }) {
  if (item.media_type === "single_photo" && item.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image_url} alt={item.title ?? "Resultado"} className="aspect-video w-full rounded-xl object-cover" />;
  }
  if (item.media_type === "gallery") {
    const images = Array.isArray(item.gallery) ? item.gallery as string[] : [];
    return images.length ? <ServiceGallery images={images} alt={item.title ?? "Resultado"} /> : null;
  }
  if (item.media_type === "youtube" && item.video_url) return <YoutubeEmbed url={item.video_url} title={item.title ?? "Resultado"} />;
  if (item.media_type === "instagram" && item.instagram_url && /^https:\/\/(www\.)?instagram\.com\/(p|reel)\//i.test(item.instagram_url)) {
    return (
      <div className="overflow-hidden rounded-xl bg-white p-1 text-black">
        <blockquote className="instagram-media" data-instgrm-permalink={item.instagram_url} data-instgrm-version="14" />
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onLoad={processInstagram} onReady={processInstagram} />
      </div>
    );
  }
  if (item.before_image && item.after_image) return <BeforeAfterSlider beforeImage={item.before_image} afterImage={item.after_image} alt={item.title ?? "Resultado"} />;
  return <div className="flex aspect-video items-center justify-center rounded-xl bg-neutral-950 text-xs text-neutral-600">Mídia não configurada</div>;
}
