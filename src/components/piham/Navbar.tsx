import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Navbar = () => {
  const { t } = useI18n();
  const links = [
    { href: "#hero", label: t("nav.home") },
    { href: "#services", label: t("nav.services") },
    { href: "#showcase", label: t("nav.showcase") },
    { href: "#about", label: t("nav.about") },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300 ${
        scrolled ? "shadow-nav" : "border-b border-transparent"
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between py-4">
          <a href="#hero" className="flex items-center gap-3 group">
            <span className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">P</span>
            </span>
            <div className="leading-tight">
              <div className="font-display font-semibold tracking-tight text-base text-primary">PIHAM</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Info Services</div>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 rounded-full hover:bg-background-elevated"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <a href="#contact" className="btn-primary">
              {t("nav.contact")}
              <span>→</span>
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10 rounded-full border border-border flex items-center justify-center"
            aria-label={t("nav.menu")}
          >
            <span className="relative w-5 h-3 block">
              <span className={`absolute left-0 top-0 w-full h-0.5 bg-foreground transition-transform duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-foreground transition-transform duration-300 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
            </span>
          </button>
        </nav>

        {open && (
          <div className="md:hidden pb-4 animate-fade-in-up">
            <div className="rounded-2xl border border-border p-2 shadow-card-soft bg-card">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium hover:bg-background-elevated rounded-xl"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 block text-center btn-primary w-full"
              >
                {t("nav.contact")}
              </a>
              <div className="mt-3 flex justify-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
