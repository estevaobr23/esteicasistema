"use client";

import Script from "next/script";

const PIXEL_ID = process.env.NEXT_PUBLIC_UTMIFY_PIXEL_ID;

declare global {
  interface Window {
    pixelId?: string;
  }
}

export default function UtmifyPixel() {
  if (!PIXEL_ID) return null;

  return (
    <Script id="utmify-pixel" strategy="afterInteractive">
      {`
        window.pixelId = "${PIXEL_ID}";
        var utmifyScript = document.createElement("script");
        utmifyScript.setAttribute("async", "");
        utmifyScript.setAttribute("defer", "");
        utmifyScript.src = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";
        document.head.appendChild(utmifyScript);
      `}
    </Script>
  );
}
