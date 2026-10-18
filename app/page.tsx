"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowUpRight, Mail, MapPin, Pause, Play, Terminal } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const CONTACT = {
  email: "your-email@example.com",
  github: "https://github.com/bobs939",
  linkedin: "https://linkedin.com",
  location: "Nagarjun, Bagmati, Nepal",
};

/** Section ↔ pipeline-stage map (mirrors the reference site's seasonal labels). */
const STAGES = [
  { id: "about", stage: "Commit", label: "About" },
  { id: "services", stage: "Build", label: "Services" },
  { id: "works", stage: "Deploy", label: "Works" },
  { id: "experience", stage: "Operate", label: "Experience" },
  { id: "contact", stage: "Monitor", label: "Contact" },
] as const;

const SERVICES = [
  { title: "Backend APIs", tools: "Python / Django / DRF" },
  { title: "Async workloads & realtime", tools: "Celery / Redis / WebSockets" },
  { title: "Containers & orchestration", tools: "Docker / Kubernetes" },
  { title: "CI/CD pipelines", tools: "GitLab CI/CD / Automated releases" },
  { title: "Data modeling", tools: "PostgreSQL / MySQL / SQL traversal" },
  { title: "Telecom & fiber systems", tools: "OLT / MDB / DB / ONU topologies" },
  { title: "Linux & reverse proxies", tools: "Ubuntu / Debian / Nginx / Shell" },
  { title: "Change management", tools: "ITIL / RFCs / Risk workflows" },
];

interface Project {
  title: string;
  domain: string;
  description: string;
  highlights: string[];
  stack: string[];
  href?: string;
}

const PROJECTS: Project[] = [
  {
    title: "ITIL Enterprise Change Management",
    domain: "Enterprise / ITSM",
    description:
      "An enterprise-grade change management system following ITIL guidelines for Requests for Comments, risk assignment, and asset topology integration.",
    highlights: ["RFC lifecycle", "Risk assignment", "Asset topology links"],
    stack: ["Django REST", "PostgreSQL", "Docker"],
  },
  {
    title: "ISP Fiber Optic Network Manager",
    domain: "Telecom / Network",
    description:
      "A relational model and backend service that maps physical fiber hierarchies across OLTs, MDBs, DBs, and ONUs with optimized SQL traversal.",
    highlights: ["OLT → ONU hierarchy", "Optimized traversal", "Redis caching"],
    stack: ["Python/Django", "PostgreSQL", "Redis"],
  },
  {
    title: "Lead Management & Conversion Funnel",
    domain: "Sales / Automation",
    description:
      "An end-to-end lead capture and conversion funnel that tracks the customer acquisition pipeline with automated OLA/SLA tracking.",
    highlights: ["OLA/SLA tracking", "Celery escalations", "Pipeline stages"],
    stack: ["DRF", "Celery", "MySQL"],
  },
  {
    title: "Self-Hosted AI Admin Assistant",
    domain: "GenAI / Realtime",
    description:
      "An asynchronous admin assistant that pairs LangGraph state machines with real-time WebSockets and React dashboards.",
    highlights: ["LangGraph agents", "Live WebSocket updates", "React dashboard"],
    stack: ["LangGraph", "WebSockets", "React"],
  },
];

const EXPERIENCE = {
  role: "DevOps Engineer & Python Backend Developer",
  org: "Internet Service Provider (ISP)",
  location: "Bagmati, Nepal",
  points: [
    "Designed and maintained containerized Django REST microservices handling core ISP operations and customer lifecycle management.",
    "Configured end-to-end GitLab CI/CD pipelines to automate testing, build Docker images, and streamline production deployments across Kubernetes/Linux nodes.",
    "Architected PostgreSQL relational models mapping enterprise asset topologies and fiber network hardware distributions.",
    "Built Celery and Redis queues for asynchronous network telemetry, billing triggers, and automated notifications.",
    "Maintained Linux servers, Nginx reverse proxies, and local development standards across engineering teams.",
  ],
};

/* ------------------------------------------------------------------ */
/* Motion plumbing                                                     */
/* ------------------------------------------------------------------ */

const MotionCtx = createContext(true);

const CSS = `
@keyframes pf-flow { to { background-position: 0 200%; } }
@keyframes pf-rise { from { transform: translateY(110%); } to { transform: none; } }
@keyframes pf-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
.pf-flow { background-size: 100% 200%; animation: pf-flow 3s linear infinite; }
.pf-line { display: block; overflow: hidden; padding-bottom: .08em; }
.pf-line > span { display: block; transform: translateY(110%); animation: pf-rise 1.1s cubic-bezier(.16,1,.3,1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .pf-flow { animation: none; }
  .pf-line > span { transform: none; animation: none; }
}
html[data-motion="off"] .pf-flow { animation: none; }
html[data-motion="off"] .pf-line > span { transform: none; animation: none; }
`;

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const motion = useContext(MotionCtx);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = seen || !motion;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: motion ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fiber-network canvas background                                     */
/* ------------------------------------------------------------------ */

function NetworkCanvas({ motion, onPackets }: { motion: boolean; onPackets: (n: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    type Node = { x: number; y: number; vx: number; vy: number };
    type Packet = { a: number; b: number; t: number; s: number };
    const LINK = 150;
    const mouse = { x: -9999, y: -9999 };
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(80, (w * h) / 18000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
      packets = [];
      if (!motion) frame();
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      if (motion) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
        }
      }

      // Fiber links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(34,211,238,${(1 - d / LINK) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Light packets travelling along links
      if (motion && packets.length < 16 && Math.random() < 0.05) {
        const a = Math.floor(Math.random() * nodes.length);
        const near = nodes
          .map((n, idx) => ({ idx, d: Math.hypot(n.x - nodes[a].x, n.y - nodes[a].y) }))
          .filter((o) => o.idx !== a && o.d < LINK);
        if (near.length) packets.push({ a, b: near[Math.floor(Math.random() * near.length)].idx, t: 0, s: 0.012 + Math.random() * 0.012 });
      }
      packets = packets.filter((p) => p.t < 1);
      for (const p of packets) {
        p.t += p.s;
        const A = nodes[p.a];
        const B = nodes[p.b];
        const x = A.x + (B.x - A.x) * p.t;
        const y = A.y + (B.y - A.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, "rgba(167,243,252,0.95)");
        g.addColorStop(1, "rgba(34,211,238,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes + cursor links
      for (const n of nodes) {
        const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const near = md < 170;
        if (near) {
          ctx.strokeStyle = `rgba(139,92,246,${(1 - md / 170) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        ctx.fillStyle = near ? "rgba(196,181,253,0.95)" : "rgba(103,232,249,0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? 2.4 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (motion) raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    if (motion) raf = requestAnimationFrame(frame);
    const stats = window.setInterval(() => onPackets(packets.length), 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(stats);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [motion, onPackets]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}

/* ------------------------------------------------------------------ */
/* Loader                                                              */
/* ------------------------------------------------------------------ */

function Loader({ onEnter }: { onEnter: (motion: boolean) => void }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1500, 1);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;
  const ready = pct >= 100;

  const choose = (motion: boolean) => {
    setLeaving(true);
    onEnter(motion);
    window.setTimeout(() => setGone(true), 900);
  };

  return (
    <div
      role="dialog"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[#03050a] p-6 transition-opacity duration-700 md:p-10 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-2 text-slate-300">
          <Terminal className="h-4 w-4 text-cyan-400" aria-hidden /> bheshraj.dev
        </span>
        <span>Motif / Fiber topology × Pipelines</span>
      </div>

      <div className="space-y-8">
        <p className="font-mono text-7xl font-semibold tabular-nums tracking-tighter text-white md:text-9xl">
          {pct}
          <span className="text-cyan-400">%</span>
        </p>
        <div className="h-px w-full overflow-hidden bg-slate-800">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${pct}%` }} />
        </div>
        <div className={`flex flex-wrap gap-3 transition-opacity duration-500 ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <button
            onClick={() => choose(true)}
            disabled={!ready}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.8)]"
          >
            Enter with motion
          </button>
          <button
            onClick={() => choose(false)}
            disabled={!ready}
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/60"
          >
            Reduced motion
          </button>
        </div>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-slate-600">DevOps Engineer & Python Backend Developer</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function StageHeading({ stage, label, children }: { stage: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400">
        {stage} / {label}
      </p>
      <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">{children}</h2>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs uppercase tracking-wider text-slate-400">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Portfolio() {
  const [entered, setEntered] = useState(false);
  const [motion, setMotion] = useState(true);
  const [packets, setPackets] = useState(0);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("about");
  const [work, setWork] = useState(0);

  // Lock scroll until the loader is dismissed.
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  // Reflect the motion choice on <html> for CSS.
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  // Scroll progress → "hops".
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Active section.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -50% 0px" },
    );
    STAGES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const stage = STAGES.find((s) => s.id === active);
  const hops = Math.round(progress * 12);
  const p = PROJECTS[work];

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "");
    const email = String(f.get("email") ?? "");
    const msg = String(f.get("message") ?? "");
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  };

  const field =
    "w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none backdrop-blur transition-colors duration-300 placeholder:text-slate-600 focus:border-cyan-500/60";

  return (
    <MotionCtx.Provider value={motion}>
      <div className="relative min-h-screen overflow-x-clip bg-[#03050a] font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        <style>{CSS}</style>
        <Loader
          onEnter={(m) => {
            setMotion(m);
            setEntered(true);
          }}
        />
        <NetworkCanvas motion={motion} onPackets={setPackets} />
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]" />

        {/* HEADER */}
        <header className="fixed inset-x-0 top-0 z-50">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <a href="#top" className="flex items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
              <Terminal className="h-5 w-5 text-cyan-400" aria-hidden />
              <span className="font-mono text-sm font-semibold tracking-tight">bheshraj.dev</span>
            </a>
            <nav aria-label="Primary" className="hidden items-center gap-1 rounded-full border border-slate-800/80 bg-slate-950/60 p-1 backdrop-blur-xl md:flex">
              {STAGES.filter((s) => s.id !== "experience").map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-300 ${
                    active === s.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              aria-pressed={motion}
              onClick={() => setMotion((m) => !m)}
              className="flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/60 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/50"
            >
              {motion ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
              Motion {motion ? "on" : "off"}
            </button>
          </div>
        </header>

        {/* HUD */}
        <aside aria-hidden className="pointer-events-none fixed bottom-5 left-6 z-40 hidden font-mono text-[11px] uppercase tracking-widest text-slate-400 sm:block">
          <p>Hops <span className="text-white tabular-nums">{String(hops).padStart(2, "0")}</span> / 12</p>
          <p>Packets <span className="text-cyan-300 tabular-nums">{packets}</span></p>
          <p className="text-slate-600">Stage / {stage?.stage}</p>
        </aside>
        <div aria-hidden className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-4 lg:flex">
          <ol className="space-y-3 text-right font-mono text-[11px] uppercase tracking-widest">
            {STAGES.map((s) => (
              <li key={s.id} className={`transition-colors duration-500 ${active === s.id ? "text-white" : "text-slate-600"}`}>
                {s.stage}
              </li>
            ))}
          </ol>
          <div className="relative h-40 w-px bg-slate-800">
            <div className="absolute inset-x-0 top-0 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ height: `${progress * 100}%` } as CSSProperties} />
          </div>
        </div>

        <main id="top">
          {/* HERO */}
          <section aria-labelledby="hero-title" className="relative flex min-h-screen flex-col justify-end px-6 pb-20 pt-32">
            <div className="mx-auto w-full max-w-7xl space-y-10">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-emerald-400/25 bg-emerald-500/5 py-1.5 pl-3 pr-4 font-mono text-xs uppercase tracking-wider text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_3px_rgba(52,211,153,0.7)]" />
                  </span>
                  System online // Open for roles
                </span>
                <Mono>Bheshraj Shrestha</Mono>
              </div>

              <h1 id="hero-title" className="text-[clamp(2.75rem,9.5vw,9rem)] font-semibold leading-[0.95] tracking-tighter">
                <span className="pf-line">
                  <span style={entered ? undefined : { animationPlayState: "paused" }} className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Make it run.
                  </span>
                </span>
                <span className="pf-line">
                  <span style={entered ? { animationDelay: "150ms" } : { animationPlayState: "paused" }} className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                    Keep it running.
                  </span>
                </span>
              </h1>

              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <p className="max-w-xl text-pretty text-lg leading-relaxed text-slate-400 md:text-xl">
                  DevOps Engineer & Python Backend Developer engineering fault-tolerant backend architectures, automated CI/CD pipelines, and high-performance telecom & enterprise systems.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <a href="#works" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.8)]">
                    See the work
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </a>
                  <span className="flex items-center gap-2 px-2 text-slate-400">
                    <MapPin className="h-4 w-4 text-cyan-400" aria-hidden />
                    {CONTACT.location}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" aria-labelledby="about-title" className="px-6 py-32">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_1fr]">
              <Reveal>
                <StageHeading stage="Commit" label="About">
                  <span id="about-title">Backend logic meets automated infrastructure.</span>
                </StageHeading>
              </Reveal>
              <Reveal delay={150} className="space-y-5 text-pretty leading-relaxed text-slate-400">
                <p>
                  I am a DevOps Engineer and Python Backend Developer specializing in scalable microservices, container orchestration, and telecom network infrastructure systems. With hands-on experience in the Internet Service Provider (ISP) and enterprise software space, I bridge the gap between complex backend application logic and robust, automated cloud and on-prem infrastructure.
                </p>
                <p>
                  My day-to-day work involves designing high-concurrency Django REST APIs, optimizing asynchronous workloads with Celery and Redis, automating deployment workflows via Docker and GitLab CI/CD, and modeling relational databases for large-scale fiber network topographies.
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Based in {CONTACT.location}</p>
              </Reveal>
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" aria-labelledby="services-title" className="px-6 py-32">
            <div className="mx-auto max-w-7xl space-y-14">
              <Reveal>
                <StageHeading stage="Build" label="Services">
                  <span id="services-title">From schema to pipeline to production.</span>
                </StageHeading>
              </Reveal>
              <ol className="border-t border-slate-800/80">
                {SERVICES.map((s, i) => (
                  <Reveal key={s.title} delay={i * 40}>
                    <li className="group grid cursor-default grid-cols-[3rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-slate-800/80 py-6 transition-all duration-500 hover:border-cyan-500/50 hover:pl-3 md:grid-cols-[4rem_1fr_1fr]">
                      <span className="font-mono text-sm text-cyan-400">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-xl font-medium tracking-tight text-slate-200 transition-colors duration-300 group-hover:text-white md:text-3xl">{s.title}</h3>
                      <p className="col-start-2 font-mono text-xs uppercase tracking-wider text-slate-500 transition-colors duration-300 group-hover:text-cyan-300 md:col-start-auto md:text-right">{s.tools}</p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>

          {/* WORKS */}
          <section id="works" aria-labelledby="works-title" className="px-6 py-32">
            <div className="mx-auto max-w-7xl space-y-14">
              <Reveal>
                <StageHeading stage="Deploy" label="Works">
                  <span id="works-title">{PROJECTS.length} projects, in production.</span>
                </StageHeading>
              </Reveal>
              <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
                <ul className="space-y-2" aria-label="Projects">
                  {PROJECTS.map((pr, i) => (
                    <li key={pr.title}>
                      <button
                        type="button"
                        aria-pressed={work === i}
                        onMouseEnter={() => setWork(i)}
                        onFocus={() => setWork(i)}
                        onClick={() => setWork(i)}
                        className={`group flex w-full items-baseline gap-4 rounded-2xl border px-5 py-5 text-left transition-all duration-500 ${
                          work === i
                            ? "border-cyan-500/50 bg-slate-900/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                            : "border-transparent hover:border-slate-800"
                        }`}
                      >
                        <span className="font-mono text-sm text-cyan-400">{String(i + 1).padStart(2, "0")}</span>
                        <span className={`text-xl font-medium tracking-tight transition-colors duration-300 md:text-2xl ${work === i ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                          {pr.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <article
                  key={work}
                  aria-live="polite"
                  className="sticky top-24 self-start overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-xl md:p-10"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-md border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-cyan-300">
                      {p.domain}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-500">
                      {String(work + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                    </span>
                  </div>
                  <p aria-hidden className="mt-8 select-none text-[7rem] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(148,163,184,0.35)] md:text-[9rem]">
                    {String(work + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-white md:text-3xl">{p.title}</h3>
                  <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-400">{p.description}</p>
                  <ul className="mt-6 space-y-2 font-mono text-xs text-slate-300">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-800/80 pt-5" aria-label="Tech stack">
                    {p.stack.map((s) => (
                      <li key={s} className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">{s}</li>
                    ))}
                  </ul>
                  {p.href && (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-cyan-300">
                      View project <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  )}
                </article>
              </div>
            </div>
          </section>

          {/* EXPERIENCE */}
          <section id="experience" aria-labelledby="experience-title" className="px-6 py-32">
            <div className="mx-auto max-w-7xl space-y-14">
              <Reveal>
                <StageHeading stage="Operate" label="Experience">
                  <span id="experience-title">Where the work happens.</span>
                </StageHeading>
              </Reveal>
              <div className="relative pl-10 md:pl-14">
                <span aria-hidden className="pf-flow absolute bottom-0 left-[11px] top-2 w-px bg-[linear-gradient(to_bottom,rgba(6,182,212,0.9),rgba(139,92,246,0.5),rgba(6,182,212,0.05),rgba(6,182,212,0.9))] md:left-[19px]" />
                <span aria-hidden className="absolute -left-0 top-2 flex h-6 w-6 items-center justify-center md:left-2 md:h-8 md:w-8">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/40 motion-reduce:animate-none" />
                  <span className="relative h-3 w-3 rounded-full border border-cyan-200 bg-cyan-400 shadow-[0_0_16px_4px_rgba(6,182,212,0.7)]" />
                </span>
                <Reveal>
                  <article className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] md:p-10">
                    <header className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div className="space-y-1">
                        <h3 className="text-balance text-2xl font-semibold tracking-tight text-white">{EXPERIENCE.role}</h3>
                        <p className="font-mono text-sm text-cyan-300">{EXPERIENCE.org}</p>
                      </div>
                      <Mono>{EXPERIENCE.location}</Mono>
                    </header>
                    <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300">
                      {EXPERIENCE.points.map((pt) => (
                        <li key={pt} className="flex gap-3">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400" aria-hidden />
                          <span className="text-pretty">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" aria-labelledby="contact-title" className="px-6 py-32">
            <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1fr]">
              <Reveal className="space-y-10">
                <StageHeading stage="Monitor" label="Contact">
                  <span id="contact-title">Have a system that needs to stay up?</span>
                </StageHeading>
                <ul className="space-y-3 text-lg">
                  {[
                    { label: "Email", href: `mailto:${CONTACT.email}` },
                    { label: "GitHub", href: CONTACT.github },
                    { label: "LinkedIn", href: CONTACT.linkedin },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-slate-300 transition-colors duration-300 hover:text-white"
                      >
                        {l.label}
                        <ArrowUpRight className="h-4 w-4 text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={150}>
                <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-xl">
                  <div>
                    <label htmlFor="name" className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">Name</label>
                    <input id="name" name="name" required autoComplete="name" className={field} />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">Email</label>
                    <input id="email" name="email" type="email" required autoComplete="email" className={field} />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">Message</label>
                    <textarea id="message" name="message" required rows={5} className={field} />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-7 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_-10px_rgba(6,182,212,0.7)]"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Send message
                  </button>
                </form>
              </Reveal>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-800/60 px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
            <p>© 2026 Bheshraj Shrestha. Built with Next.js & Tailwind CSS.</p>
            <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
              <span>Deployed on Vercel</span>
              <a href="#top" className="transition-colors hover:text-cyan-300">Back to top</a>
            </div>
          </div>
        </footer>
      </div>
    </MotionCtx.Provider>
  );
}