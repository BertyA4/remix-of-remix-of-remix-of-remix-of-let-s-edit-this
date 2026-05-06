import { SectionHeading } from "./SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditableList } from "./Editable";

type Sector = { name: string; icon: string };
const DEFAULT_SECTORS: Sector[] = [
  { name: "Administrations publiques", icon: "🏛" },
  { name: "Banques & assurances", icon: "🏦" },
  { name: "Télécom & opérateurs", icon: "📡" },
  { name: "Hôtellerie & immobilier", icon: "🏨" },
  { name: "Industrie & énergie", icon: "⚡" },
  { name: "Santé & éducation", icon: "🏥" },
  { name: "ONG & coopération", icon: "🌍" },
  { name: "Commerce & retail", icon: "🛍" },
];

export const Sectors = () => {
  const ref = useReveal<HTMLDivElement>();
  const { content } = useSiteContent();
  const sectors = useEditableList<Sector>("sectors.list_json", DEFAULT_SECTORS);
  return (
    <section id="sectors" className="relative py-24 md:py-28 bg-background">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow={content["sectors.eyebrow"]}
          title={
            <>
              {content["sectors.title_line1"]} <br />
              <span className="text-gradient-accent">{content["sectors.title_accent"]}</span>
            </>
          }
          description={content["sectors.description"]}
        />

        <div ref={ref} className="reveal-up mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {sectors.map((s, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card p-6 text-center hover:border-[hsl(var(--accent))]/40 hover:shadow-card-soft transition-all duration-300"
              style={{ transitionDelay: `${i * 0.04}s` }}
            >
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <div className="mt-3 text-sm font-medium text-primary">{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
