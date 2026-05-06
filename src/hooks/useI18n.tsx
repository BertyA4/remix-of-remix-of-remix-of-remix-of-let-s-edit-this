import type { ReactNode } from "react";
import { TRANSLATIONS } from "@/i18n/translations";

// Multi-language support removed. French only.
const dict = TRANSLATIONS.fr;

export const I18nProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export const useI18n = () => ({
  lang: "fr" as const,
  setLang: (_l: unknown) => {},
  t: (key: string, vars?: Record<string, string>) => {
    let str = dict[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      }
    }
    return str;
  },
});
