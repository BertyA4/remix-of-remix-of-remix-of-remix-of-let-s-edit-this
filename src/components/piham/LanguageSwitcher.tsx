import { useI18n } from "@/hooks/useI18n";
import { LANGS } from "@/i18n/translations";

export const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border border-border bg-background-elevated p-0.5 text-[11px] font-semibold ${className}`}
    >
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            title={l.full}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};
