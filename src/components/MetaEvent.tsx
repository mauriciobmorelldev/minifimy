"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent, type MetaCustomData, type MetaEventName } from "@/lib/meta-events";

interface MetaEventProps {
  name: MetaEventName;
  data?: MetaCustomData;
  eventKey: string;
  eventId?: string;
  order?: { id: number; key: string };
}

export function MetaEvent({ name, data = {}, eventKey, eventId, order }: MetaEventProps) {
  const trackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (trackedKey.current === eventKey) return;
    trackedKey.current = eventKey;
    trackMetaEvent(name, data, { eventId, order });
  }, [data, eventId, eventKey, name, order]);

  return null;
}
