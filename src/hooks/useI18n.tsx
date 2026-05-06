import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Lang, TRANSLATIONS } from "@/i18n/translations";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "piham-lang";

const getInitial = (): Lang => {
  if (typeof window === "undefined") return "fr";
  const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved === "fr" || saved === "en" || saved === "ee") return saved;
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("ee")) return "ee";
  return "fr";
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(getInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.fr;
      let str = dict[key] ?? TRANSLATIONS.fr[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        }
      }
      return str;
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
