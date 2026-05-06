import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { buildWaUrl, openWaUrl } from "@/lib/whatsapp";
import { useI18n } from "@/hooks/useI18n";

const SERVICES = [
  { value: "btp", label: "BTP & Construction" },
  { value: "cablage-reseau", label: "Câblage réseau" },
  { value: "cctv", label: "Vidéosurveillance (CCTV)" },
  { value: "detection-incendie", label: "Détection incendie" },
  { value: "fournitures", label: "Fournitures & équipements" },
  { value: "autre", label: "Autre / Conseil" },
];

const BUDGETS = [
  "< 1 M FCFA",
  "1 – 5 M FCFA",
  "5 – 20 M FCFA",
  "20 – 100 M FCFA",
  "> 100 M FCFA",
  "À définir",
];

const makeSchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().trim().min(2, t("contact.error.nameShort")).max(100),
    email: z.string().trim().email(t("contact.error.email")).max(255),
    phone: z.string().trim().min(6, t("contact.error.phone")).max(30),
    service: z.string().min(1, t("contact.error.service")),
    budget: z.string().min(1),
    message: z.string().trim().min(10, t("contact.error.message")).max(2000),
  });

export const Contact = () => {
  const ref = useReveal<HTMLDivElement>();
  const { content } = useSiteContent();
  const { t } = useI18n();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ name: string; service: string } | null>(null);

  const phone = content["contact.phone"] ?? "";
  const email = content["contact.email"] ?? "";
  const address = content["contact.address"] ?? "";
  const hours = content["contact.hours"] ?? "Lun — Sam · 08:00 – 18:00";
  const waPhoneRaw = (content["contact.whatsapp"] ?? phone).trim();
  const waLink = buildWaUrl(waPhoneRaw);
  const waLinkWithMsg = buildWaUrl(waPhoneRaw, "Bonjour, je viens de soumettre une demande de devis.");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      service: String(fd.get("service") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = makeSchema(t).safeParse(raw);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first ?? t("contact.error.checkFields"));
      return;
    }
    setSubmitting(true);
    try {
      const title = `${SERVICES.find((s) => s.value === parsed.data.service)?.label ?? parsed.data.service} — ${parsed.data.name}`;
      const fullMsg = `${parsed.data.message}\n\n— Contact —\nNom: ${parsed.data.name}\nEmail: ${parsed.data.email}\nTéléphone: ${parsed.data.phone}`;
      const { error } = await supabase.from("quote_requests").insert({
        user_id: user?.id ?? null,
        service: parsed.data.service,
        title,
        message: fullMsg,
        budget: parsed.data.budget,
      });
      if (error) throw error;
      setDone({ name: parsed.data.name, service: SERVICES.find((s) => s.value === parsed.data.service)?.label ?? parsed.data.service });
      toast.success(t("contact.toast.sent"), { description: t("contact.toast.sentDesc") });
    } catch (err: any) {
      toast.error(t("contact.toast.fail"), { description: err.message ?? t("contact.toast.retry") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-background-elevated">
      <div className="container">
        <SectionHeading
          eyebrow={content["contact.eyebrow"] ?? "Devis express"}
          title={
            <>
              {content["contact.title_line1"] ?? "Parlons de votre"} <br />
              <span className="text-gradient-accent">{content["contact.title_accent"] ?? "prochain projet."}</span>
            </>
          }
          description={content["contact.description"] ?? "Recevez une réponse personnalisée sous 24 heures ouvrées."}
        />

        <div ref={ref} className="reveal-up mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Infos */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-7 shadow-soft space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground/80">{t("contact.guarantee")}</span>
              </div>
              <InfoRow
                icon={<Phone className="w-5 h-5" />}
                label={t("contact.phone")}
                value={phone}
                href={`tel:${phone.replace(/\s/g, "")}`}
              />
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                label={t("contact.email")}
                value={email}
                href={`mailto:${email}`}
              />
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                label={t("contact.address")}
                value={address}
              />
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                label={t("contact.hours")}
                value={hours}
              />
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openWaUrl(e, waLink, "contact_card")}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("contact.whatsapp")}
                </a>
              )}
            </div>
          </div>

          {/* Form / Confirmation */}
          <div className="lg:col-span-7">
            {done ? (
              <div className="rounded-2xl bg-card border border-[hsl(var(--accent))]/40 p-8 md:p-10 shadow-elevated text-center space-y-5 animate-fade-in">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                    {t("contact.thanks", { name: done.name })}
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    {t("contact.thanksDesc", { service: done.service })}
                  </p>
                </div>
                <ol className="text-left max-w-md mx-auto space-y-2 text-sm">
                  {[t("contact.step1"), t("contact.step2"), t("contact.step3")].map((s, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-foreground/80">{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {waLinkWithMsg && (
                    <a
                      href={waLinkWithMsg}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => openWaUrl(e, waLinkWithMsg, "contact_confirmation")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 text-sm"
                    >
                      <MessageCircle className="h-4 w-4" /> {t("contact.whatsappFast")}
                    </a>
                  )}
                  <button onClick={() => setDone(null)} className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-muted">
                    {t("contact.newRequest")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="rounded-2xl bg-card border border-border p-7 md:p-9 shadow-soft space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold">
                    {t("contact.badge")}
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{t("contact.formTitle")}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("contact.field.name")} name="name" autoComplete="name" required />
                  <Field label={t("contact.field.phone")} name="phone" type="tel" autoComplete="tel" required />
                </div>
                <Field label={t("contact.field.email")} name="email" type="email" autoComplete="email" required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label={t("contact.field.service")} name="service" options={SERVICES.map((s) => ({ value: s.value, label: s.label }))} required placeholder={t("contact.select.placeholder")} />
                  <Select label={t("contact.field.budget")} name="budget" options={BUDGETS.map((b) => ({ value: b, label: b }))} required placeholder={t("contact.select.placeholder")} />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold">
                    {t("contact.field.message")}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder={t("contact.field.messagePlaceholder")}
                    className="w-full rounded-xl bg-background border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent))]/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 shadow-[0_10px_40px_hsl(var(--accent)/0.45)]"
                >
                  {submitting ? t("contact.submitting") : t("contact.submit")}
                  <span>→</span>
                </button>

                {waPhoneRaw && (
                  <button
                    type="button"
                    onClick={(e) => {
                      const form = (e.currentTarget.closest("form") as HTMLFormElement | null);
                      if (!form) return;
                      const fd = new FormData(form);
                      const name = String(fd.get("name") ?? "").trim();
                      const serviceVal = String(fd.get("service") ?? "");
                      const serviceLabel = SERVICES.find((s) => s.value === serviceVal)?.label ?? serviceVal;
                      const budget = String(fd.get("budget") ?? "");
                      const msg = String(fd.get("message") ?? "").trim();
                      const lines = [
                        "Bonjour PIHAM Info Services,",
                        "",
                        name ? `Nom : ${name}` : null,
                        serviceLabel ? `Service : ${serviceLabel}` : null,
                        budget ? `Budget : ${budget}` : null,
                        msg ? `\nProjet :\n${msg}` : null,
                      ].filter(Boolean).join("\n");
                      const url = buildWaUrl(waPhoneRaw, lines);
                      if (!url) return;
                      const win = window.open(url, "_blank", "noopener,noreferrer");
                      setTimeout(() => {
                        if (!win || win.closed) {
                          alert(`Impossible d'ouvrir WhatsApp. Appelez-nous : ${phone || "+228 99 50 00 54"}`);
                        }
                      }, 1500);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500 hover:text-white font-semibold py-3 text-sm transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("contact.whatsappAlso")}
                  </button>
                )}

                <p className="text-[11px] text-muted-foreground text-center">
                  {t("contact.disclaimer")}
                </p>
                {!user && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    {t("contact.tipAccount").split(t("contact.tipAccountLink"))[0]}
                    <Link to="/auth" className="underline hover:text-foreground">{t("contact.tipAccountLink")}</Link>
                    {t("contact.tipAccount").split(t("contact.tipAccountLink"))[1]}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, name, type = "text", required, autoComplete }: { label: string; name: string; type?: string; required?: boolean; autoComplete?: string }) => (
  <div>
    <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      autoComplete={autoComplete}
      className="w-full rounded-xl bg-background border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent))]/20 transition-all"
    />
  </div>
);

const Select = ({ label, name, options, required, placeholder }: { label: string; name: string; options: { value: string; label: string }[]; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold">{label}</label>
    <select
      name={name}
      required={required}
      defaultValue=""
      className="w-full rounded-xl bg-background border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent))]/20 transition-all"
    >
      <option value="" disabled>{placeholder ?? "Sélectionner…"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const InfoRow = ({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) => {
  const inner = (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-background-elevated flex items-center justify-center text-[hsl(var(--accent))] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">{label}</div>
        <div className="mt-1 text-sm font-medium text-primary break-words">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} className="block hover:opacity-80 transition-opacity">{inner}</a> : inner;
};
