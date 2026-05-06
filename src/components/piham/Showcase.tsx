import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SectionHeading } from "./SectionHeading";
import { Lightbox, type MediaItem } from "./Lightbox";
import { useReveal } from "@/hooks/useReveal";
import rehab1 from "@/assets/showcase-rehab-1.jpg";
import rehab2 from "@/assets/showcase-rehab-2.jpg";
import rehab3 from "@/assets/showcase-rehab-3.jpg";
import rehab4 from "@/assets/showcase-rehab-4.jpg";
import rehab5 from "@/assets/showcase-rehab-5.jpg";
import rehab6 from "@/assets/showcase-rehab-6.jpg";
import rehabVideo from "@/assets/showcase-rehab-video.mp4.asset.json";

export const Showcase = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const sectionRef = useReveal<HTMLDivElement>(0.18);
  const gridRef = useReveal<HTMLDivElement>(0.12);
  const { content, getImage } = useSiteContent();
  const pick = (key: string, fallback: string) =>
    (content[key] ?? "").trim() ? getImage(key) : fallback;

  const projects: MediaItem[] = [
    { type: "image", src: pick("showcase.image1_url", rehab1), title: content["showcase.image1_title"] || "Façade coloniale — avant intervention", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image2_url", rehab2), title: content["showcase.image2_title"] || "Façade restaurée — livraison finale", tag: "Réhabilitation" },
    { type: "video", src: rehabVideo.url, poster: pick("showcase.image3_url", rehab3), title: content["showcase.image3_title"] || "Chantier de réhabilitation — vidéo", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image4_url", rehab4), title: content["showcase.image4_title"] || "Salle de classe — préparation", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image5_url", rehab5), title: content["showcase.image5_title"] || "Salle de classe — après livraison", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image6_url", rehab6), title: content["showcase.image6_title"] || "Bâtiment municipal — réhabilitation complète", tag: "Réhabilitation" },
  ];

  return (
    <section id="showcase" className="relative py-24 md:py-32 bg-background-elevated">
      <div ref={sectionRef} className="container reveal-stagger [perspective:1400px]">
        <SectionHeading
          eyebrow={content["showcase.eyebrow"]}
          title={
            <>
              {content["showcase.title_line1"]} <br />
              <span className="text-gradient-accent">{content["showcase.title_accent"]}</span>
            </>
          }
          description={content["showcase.description"]}
        />

        <div ref={gridRef} className="reveal-stagger [perspective:1200px] mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => {
            const thumb = p.type === "video" ? p.poster : p.src;
            const isAboveFold = i < 3;
            const imgKey = `showcase.image${i + 1}_url`;
            return (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="card-airbnb group text-left"
                style={{ transitionDelay: `${i * 0.11}s` }}
                aria-label={`Ouvrir ${p.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={thumb}
                    alt={p.title}
                    loading={isAboveFold ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={isAboveFold ? "high" : "low"}
                    width={1024}
                    height={768}
                    data-editable-key={imgKey}
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-primary">
                    {p.tag}
                  </div>
                  {p.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <span className="h-16 w-16 rounded-full bg-white/95 flex items-center justify-center text-primary shadow-card group-hover:scale-110 transition-transform duration-300">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 ml-1">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="text-sm font-medium text-primary">{p.title}</div>
                  <span className="h-8 w-8 rounded-full bg-background-elevated flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    ↗
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          items={projects}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </section>
  );
};
