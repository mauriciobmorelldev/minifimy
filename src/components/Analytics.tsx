"use client";

/* eslint-disable @next/next/no-img-element */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackMetaEvent } from "@/lib/meta-events";

let lastTrackedPathname: string | null = null;

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1130501562085721";
  const pathname = usePathname();
  const [pixelReady, setPixelReady] = useState(false);
  useEffect(() => {
    if (!pixelReady || pathname === lastTrackedPathname) return;
    lastTrackedPathname = pathname;
    trackMetaEvent("PageView");
  }, [pathname, pixelReady]);

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      <Script id="meta-pixel" strategy="afterInteractive" onReady={() => setPixelReady(true)}>
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${JSON.stringify(pixelId)});
          fbq('set', 'autoConfig', false, ${JSON.stringify(pixelId)});
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
