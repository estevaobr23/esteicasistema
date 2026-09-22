"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/domain/track";

export default function PageViewTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    trackEvent(businessId, "page_view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
