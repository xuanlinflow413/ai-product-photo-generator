"use client";

import Script from "next/script";

export const PLAUSIBLE_DOMAIN = "editimages.app";

export function PlausibleScript() {
  return (
    <>
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
      </Script>
      <Script
        src="https://plausible.io/js/script.js"
        data-domain={PLAUSIBLE_DOMAIN}
        strategy="afterInteractive"
      />
    </>
  );
}
