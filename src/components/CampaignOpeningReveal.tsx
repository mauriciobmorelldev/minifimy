import styles from "./CampaignOpeningReveal.module.css";

export function CampaignOpeningReveal({ opensAt }: { opensAt: number }) {
  const storageKey = JSON.stringify(`minifimy-opening-reveal:${opensAt}`);
  const playBeforePaint = `
    (() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      try {
        if (sessionStorage.getItem(${storageKey})) return;
        sessionStorage.setItem(${storageKey}, 'shown');
      } catch {
        // The reveal can still play when browser storage is disabled.
      }
      document.currentScript.parentElement.hidden = false;
    })();
  `;

  return (
    <div aria-hidden="true" className={styles.reveal} hidden suppressHydrationWarning>
      <script id="minifimy-opening-reveal" dangerouslySetInnerHTML={{ __html: playBeforePaint }} />
      <div className={styles.left} />
      <div className={styles.right} />
      <span className={styles.message}>Ya abrimos</span>
    </div>
  );
}
