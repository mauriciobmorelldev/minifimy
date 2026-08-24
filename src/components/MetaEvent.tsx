"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent, type MetaCustomData, type MetaEventName } from "@/lib/meta-events";

interface MetaEventProps {
  name: MetaEventName;
  data?: MetaCustomData;
  eventKey: string;
  eventId?: string;
  order?: { id: number; key: string };
  persistKey?: string;
}

export function MetaEvent({ name, data = {}, eventKey, eventId, order, persistKey }: MetaEventProps) {
  const trackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (trackedKey.current === eventKey) return;
    const storageKey = persistKey ? `minifimy:meta-once:${persistKey}` : null;

    try {
      if (storageKey && window.localStorage.getItem(storageKey)) return;
    } catch {
      // El tracking sigue funcionando si el navegador bloquea localStorage.
    }

    trackedKey.current = eventKey;
    trackMetaEvent(name, data, { eventId, order });

    try {
      if (storageKey) window.localStorage.setItem(storageKey, eventId ?? eventKey);
    } catch {
      // event_id conserva la deduplicación aun sin almacenamiento local.
    }
  }, [data, eventId, eventKey, name, order, persistKey]);

  return null;
}
