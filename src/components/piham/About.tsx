import { SectionHeading } from "./SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Editable, EditableMultiline, EditableImage, useEditableList } from "./Editable";
import { CONTENT_DEFAULTS } from "@/data/contentDefaults";

type Value = { k: string; d: string };

export const About = () => {
  const colRef = useReveal<HTMLDivElement>();
  const imgRef = useReveal<HTMLDivElement>();
  const { content } = useSiteContent();
  const values = useEditableList<Value>("about.values_json", JSON.parse(CONTENT_DEFAULTS["about.values_json"]));

  return (
    <section id="about" className="relative py-24 md:py-32 bg-background">
      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <SectionHeading
            eyebrow={content["about.eyebrow"]}
            title={
              <>
                <Editable contentKey="about.title_line1" fallback={CONTENT_DEFAULTS["about.title_line1"]} /> <br />
                <span className="text-gradient-accent">
                  <Editable contentKey="about.title_accent" fallback={CONTENT_DEFAULTS["about.title_accent"]} />
                </span>
              </>
            }
            description={content["about.description"]}
          />

          <div ref={colRef} className="reveal-up mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-card-soft transition-all duration-300"
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                <div className="text-xs font-mono text-[hsl(var(--accent))]">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-primary">{v.k}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={imgRef} className="reveal-up lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden shadow-hover">
            <EditableImage
              contentKey="about.image_url"
              fallback={CONTENT_DEFAULTS["about.image_url"]}
              altKey="about.image_alt"
              alt={CONTENT_DEFAULTS["about.image_alt"]}
              className="w-full h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--gold))] font-semibold">
                <Editable contentKey="about.promise_label" fallback={CONTENT_DEFAULTS["about.promise_label"]} />
              </div>
              <EditableMultiline
                contentKey="about.promise_quote"
                fallback={CONTENT_DEFAULTS["about.promise_quote"]}
                className="mt-3 font-display text-xl md:text-2xl text-white leading-snug"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
