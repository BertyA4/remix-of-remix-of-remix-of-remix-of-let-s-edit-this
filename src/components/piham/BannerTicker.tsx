import { useEffect, useRef } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const BannerTicker = () => {
  const { content } = useSiteContent();
  const enabled = (content["banner.enabled"] ?? "").toLowerCase() === "true";
  const message = (content["banner.message"] ?? "").trim();
  const visible = enabled && !!message;

  const ref = useRef<HTMLDivElement>(null);

  // Publish the actual rendered banner height as --banner-h so the nav
  // (and any other fixed element) can offset itself reliably across
  // breakpoints, font scaling, and admin toggles.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.setProperty("--banner-h", "0px");
      return;
    }
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      root.style.setProperty("--banner-h", `${h}px`);
    };
    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      root.style.setProperty("--banner-h", "0px");
    };
  }, [visible, message]);

  if (!visible) return null;

  const items = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-[60] overflow-hidden bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(330_90%_55%)] to-[hsl(var(--gold))] text-white"
    >
      <div className="flex whitespace-nowrap py-1.5 animate-[ticker_28s_linear_infinite]">
        {items.map((i) => (
          <span key={i} className="mx-8 text-xs font-medium tracking-wide uppercase">
            ★ {message}
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
};
