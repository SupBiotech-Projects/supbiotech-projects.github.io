import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Github, BookOpen, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseSitemap, type Volume } from "@/lib/parseSitemap";
import { SITE_CONFIG } from "@/lib/siteConfig";
import journalLogo from "@/assets/journal-logo.png";
import supbiotechLogo from "@/assets/supbiotech-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_CONFIG.title} — Student Academic Journal` },
      {
        name: "description",
        content:
          "Official site of the SupBiotech Projects Journal: undergraduate research, reviews, and project reports from SupBiotech students.",
      },
      { property: "og:title", content: SITE_CONFIG.title },
      {
        property: "og:description",
        content: SITE_CONFIG.tagline,
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const MIN_VOLUMES = 3;

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function VolumeCard({ volume, index }: { volume: Volume; index: number }) {
  const ref = useReveal<HTMLAnchorElement>();
  const hasCover = volume.coverUrl.trim().length > 0;
  const hasContents = volume.contentsUrl.trim().length > 0;

  const inner = (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        {hasCover ? (
          <img
            src={volume.coverUrl}
            alt={`Cover of Volume ${volume.number}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-hero text-primary-foreground">
            <BookOpen className="h-10 w-10 opacity-80" aria-hidden />
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest opacity-70">
                Volume
              </div>
              <div className="text-3xl font-bold">{volume.number}</div>
              <div className="mt-2 text-xs opacity-70">Coming soon</div>
            </div>
          </div>
        )}
        {hasContents && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-foreground/80 to-transparent p-3 text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-xs font-medium">View contents</span>
            <ExternalLink className="h-4 w-4" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Volume {volume.number}
          </div>
          <div className="text-sm font-semibold text-foreground">
            {volume.date || "Date TBA"}
          </div>
        </div>
        {volume.pdfUrl && hasContents && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-secondary-foreground">
            <FileText className="h-3 w-3" aria-hidden /> PDF
          </span>
        )}
      </div>
    </>
  );

  const baseClass =
    "group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow";

  if (hasContents) {
    return (
      <a
        ref={ref}
        href={volume.contentsUrl}
        target="_blank"
        rel="noreferrer noopener"
        className={baseClass}
        style={{ transitionDelay: `${(index % 4) * 60}ms` }}
        aria-label={`Open contents page of Volume ${volume.number}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className={baseClass + " cursor-default"}
      style={{ transitionDelay: `${(index % 4) * 60}ms` }}
    >
      {inner}
    </div>
  );
}

function Index() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/sitemap.txt", { cache: "no-cache" })
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (cancelled) return;
        setVolumes(parseSitemap(text));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Always render at least MIN_VOLUMES placeholders
  const display: Volume[] = (() => {
    const byNumber = new Map(volumes.map((v) => [v.number, v]));
    const max = Math.max(MIN_VOLUMES, ...volumes.map((v) => v.number), 0);
    const list: Volume[] = [];
    for (let n = 1; n <= max; n++) {
      list.push(
        byNumber.get(n) ?? {
          number: n,
          date: "",
          coverUrl: "",
          contentsUrl: "",
          pdfUrl: "",
        },
      );
    }
    // Preserve sitemap order if user reordered: prefer the order from `volumes`
    if (volumes.length > 0) {
      const ordered = [
        ...volumes,
        ...list.filter((l) => !volumes.find((v) => v.number === l.number)),
      ];
      return ordered;
    }
    return list;
  })();

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label={`${SITE_CONFIG.title} home`}
          >
            <img
              src={journalLogo}
              alt="SupBiotech Projects Journal logo"
              width={80}
              height={80}
              className="h-9 w-9 object-contain"
            />
            <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
              SupBiotech Projects Journal
            </span>
          </a>
          <div className="flex items-center gap-4">
            <img
              src={supbiotechLogo}
              alt="SupBiotech logo"
              width={120}
              height={32}
              className="hidden h-7 w-auto object-contain sm:block"
            />
            <Button asChild size="sm" variant="outline">
              <a
                href={SITE_CONFIG.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub repositories"
              >
                <Github className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative isolate overflow-hidden bg-gradient-hero text-primary-foreground"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.72 0.16 280 / 0.5), transparent 40%), radial-gradient(circle at 80% 60%, oklch(0.62 0.18 195 / 0.5), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:py-28 md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur">
            Official site
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {SITE_CONFIG.title}
          </h1>
          <p className="max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
            {SITE_CONFIG.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
            >
              <a href="#volumes">
                <BookOpen className="mr-2 h-4 w-4" /> Browse volumes
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a
                href={SITE_CONFIG.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Github className="mr-2 h-4 w-4" /> GitHub repositories
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="h-px w-8 bg-primary" /> About
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          A journal{" "}
          <span className="text-gradient-primary">written by students</span>,
          for the scientific community.
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
          {SITE_CONFIG.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Volumes */}
      <section
        id="volumes"
        className="mx-auto max-w-6xl px-6 pb-24 pt-4 sm:pb-32"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-px w-8 bg-primary" /> Archive
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              All volumes
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {loaded
              ? `${volumes.length} published · ${display.length} shown`
              : "Loading…"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {display.map((v, i) => (
            <VolumeCard key={v.number} volume={v} index={i} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {SITE_CONFIG.title}. Maintained by
            SupBiotech students.
          </p>
          <a
            href={SITE_CONFIG.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
export default Index;
