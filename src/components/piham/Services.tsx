import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { services, type ServiceDetail } from "@/data/services";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Services = () => {
  const { content, getImage } = useSiteContent();
  const keyMap: Record<string, string> = {
    btp: "services.image_btp_url",
    "cablage-reseau": "services.image_cablage_url",
    cctv: "services.image_cctv_url",
    "detection-incendie": "services.image_incendie_url",
    fournitures: "services.image_fournitures_url",
  };
  return (
    <section id="services" className="relative py-24 md:py-32 bg-background">
      <div className="container">
        <SectionHeading
          eyebrow={content["services.eyebrow"]}
          title={
            <>
              {content["services.title_line1"]} <br />
              <span className="text-gradient-accent">{content["services.title_accent"]}</span>
            </>
          }
          description={content["services.description"]}
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((s, i) => {
            const k = keyMap[s.slug];
            const override = k ? (content[k] ?? "").trim() : "";
            const image = override ? getImage(k) : s.image;
            return <ServiceCard key={s.title} service={{ ...s, image }} delay={i * 0.1} editKey={k} />;
          })}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service, delay, editKey }: { service: ServiceDetail; delay: number; editKey?: string }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Link to={`/services/${service.slug}`} className="block">
      <article
        ref={ref}
        className="reveal-up card-airbnb group cursor-pointer h-full"
        style={{ transitionDelay: `${delay}s` }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            data-editable-key={editKey}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-primary">
            {service.tag}
          </div>
        </div>

        <div className="p-6 md:p-7">
          <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            {service.title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {service.description}
          </p>

          <ul className="mt-5 space-y-2">
            {service.items.slice(0, 3).map((it) => (
              <li key={it} className="flex items-center gap-3 text-sm text-foreground/80">
                <span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" />
                {it}
              </li>
            ))}
          </ul>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] story-link">
            En savoir plus <span>→</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

