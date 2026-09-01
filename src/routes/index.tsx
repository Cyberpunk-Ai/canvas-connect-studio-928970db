import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sparkles,
  Play,
  Heart,
  Home,
  Search,
  PlusCircle,
  Bell,
  User,
  Video,
  Users,
  MessagesSquare,
  ShieldCheck,
  LineChart,
  Globe,
  Check,
  Star,
  Menu,
  X,
  ArrowRight,
  Zap,
  Radio,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------------------------------- hooks --------------------------------- */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { ref, visible } = useReveal<HTMLSpanElement>();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = 1600;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, to]);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

/* ---------------------------------- data ---------------------------------- */

const avatars = [
  { initials: "EW", from: "from-violet-500", to: "to-pink-500" },
  { initials: "DP", from: "from-blue-500", to: "to-cyan-500" },
  { initials: "PS", from: "from-orange-500", to: "to-red-500" },
  { initials: "MK", from: "from-emerald-500", to: "to-teal-500" },
];

function Avatar({
  initials,
  from,
  to,
  size = "w-10 h-10 text-xs",
  ring = true,
}: {
  initials: string;
  from: string;
  to: string;
  size?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${from} ${to} font-bold text-white ${size} ${
        ring ? "border-2 border-white" : ""
      }`}
    >
      {initials}
    </span>
  );
}

/* ----------------------------------- nav ----------------------------------- */

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Community", href: "#community" },
    { label: "Creators", href: "#creators" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-4 sm:px-6">
      <div
        className={`mx-auto max-w-7xl rounded-full px-6 py-3 transition-all duration-300 glass-panel ${
          scrolled ? "shadow-lift" : "shadow-soft"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="#top" className="text-2xl font-extrabold tracking-tight">
            Lumen
          </a>
          <div className="hidden items-center space-x-8 text-sm font-medium text-gray-700 md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="nav-link-hover">
                {l.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center space-x-4 md:flex">
            <Link
              to="/auth"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-brand"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-gradient-to-r from-brand to-brand-pink px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
          <button
            className="rounded-full p-2 text-gray-700 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="mt-3 space-y-1 border-t border-gray-200 pb-2 pt-3 md:hidden">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-full bg-gradient-to-r from-brand to-brand-pink px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ---------------------------------- hero ----------------------------------- */

function PhoneMockup() {
  return (
    <div className="relative flex justify-center">
      <div className="relative h-[580px] w-72 rounded-[3rem] bg-gray-900 p-2 shadow-lift ring-1 ring-white/20">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-white">
          <div className="absolute top-0 flex h-24 w-full items-start justify-between bg-gradient-to-br from-brand to-brand-pink p-6">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white">Lumen</span>
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-3 px-4 pt-28">
            <div className="h-32 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100" />
              <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-100 to-red-100" />
              <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100" />
            </div>
          </div>
          <div className="absolute bottom-0 flex h-16 w-full items-center justify-around border-t bg-white text-gray-400">
            <Home className="h-5 w-5 text-brand" />
            <Search className="h-5 w-5" />
            <PlusCircle className="-mt-4 h-9 w-9 text-brand" />
            <Video className="h-5 w-5" />
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="glass-panel absolute -right-2 top-1/4 rounded-2xl p-4 shadow-soft animate-float sm:-right-4">
        <div className="flex items-center gap-3">
          <Avatar initials="SA" from="from-pink-500" to="to-orange-500" ring={false} />
          <div>
            <p className="text-sm font-bold">Sarah liked your post</p>
            <p className="text-xs text-gray-500">Just now</p>
          </div>
          <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header id="top" className="relative flex min-h-[900px] items-center overflow-hidden pt-28">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute left-1/4 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-400 blur-[120px]" />
        <div className="absolute right-1/4 top-40 h-96 w-96 animate-pulse rounded-full bg-pink-400 blur-[120px] [animation-delay:2s]" />
        <div className="absolute -bottom-20 left-1/2 h-96 w-96 animate-pulse rounded-full bg-orange-400 blur-[120px] [animation-delay:4s]" />
      </div>
      <div className="container relative z-10 mx-auto grid items-center gap-12 px-6 md:grid-cols-2">
        <Reveal className="space-y-8">
          <div className="glass-panel inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            <span>Now with AI-powered feed</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Where your world <br />
            <span className="gradient-text">comes to life</span>
          </h1>
          <p className="max-w-lg text-xl text-gray-600">
            Connect with friends, share moments, and discover a community that
            celebrates creativity. Built for the way you actually live.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/auth"
              className="rounded-full bg-gradient-to-r from-brand to-brand-pink px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="glass-panel flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-gray-800 transition-colors hover:bg-white"
            >
              <Play className="h-4 w-4 fill-current" /> Watch demo
            </a>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-3">
              {avatars.map((a) => (
                <Avatar key={a.initials} {...a} />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Loved by <strong className="text-gray-900">2M+</strong> creators
            </p>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <PhoneMockup />
        </Reveal>
      </div>
    </header>
  );
}

/* -------------------------------- logo cloud ------------------------------- */

function LogoCloud() {
  const logos = ["Nimbus", "Vertex", "Atlas", "Helix", "Cobalt"];
  return (
    <section className="border-y border-gray-200 bg-white/50 py-12">
      <div className="container mx-auto px-6">
        <p className="mb-8 text-center text-sm uppercase tracking-widest text-gray-400">
          Trusted by teams worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-60 grayscale transition-all duration-500 hover:grayscale-0">
          {logos.map((l) => (
            <span key={l} className="text-2xl font-bold text-gray-400">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- features --------------------------------- */

const iconBox =
  "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white";

function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-32">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
            Everything you need to <span className="gradient-text">stay connected</span>
          </h2>
          <p className="text-xl text-gray-600">
            Powerful tools designed to help you express yourself, build
            relationships, and grow your audience.
          </p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <div className="glass-panel h-full rounded-3xl p-10 shadow-soft transition-all duration-500 hover:shadow-lift">
              <div className="mb-8 flex items-start justify-between">
                <div className={`${iconBox} from-violet-500 to-pink-500`}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Smart Feed
                </span>
              </div>
              <h3 className="mb-4 text-3xl font-bold">An algorithm that actually gets you</h3>
              <p className="text-lg text-gray-600">
                Our AI learns what you love and surfaces content from people and
                topics that matter to you — no doomscrolling required.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="glass-panel h-full rounded-3xl p-10 shadow-soft transition-all duration-500 hover:shadow-lift">
              <div className={`${iconBox} mb-8 from-blue-500 to-cyan-500`}>
                <Video className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Stories &amp; Reels</h3>
              <p className="text-gray-600">
                Share fleeting moments or polished short-form video with
                cinematic editing tools built right in.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="glass-panel h-full rounded-3xl p-10 shadow-soft transition-all duration-500 hover:shadow-lift">
              <div className={`${iconBox} mb-8 from-orange-500 to-red-500`}>
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Communities</h3>
              <p className="text-gray-600">
                Find your tribe. Join groups around your hobbies, interests, and
                passions.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="md:col-span-2">
            <div className="glass-panel h-full rounded-3xl p-10 shadow-soft transition-all duration-500 hover:shadow-lift">
              <div className="mb-8 flex items-start justify-between">
                <div className={`${iconBox} from-emerald-500 to-teal-500`}>
                  <MessagesSquare className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Real-time
                </span>
              </div>
              <h3 className="mb-4 text-3xl font-bold">Chat, call, and gather in one place</h3>
              <p className="text-lg text-gray-600">
                End-to-end encrypted messaging, voice notes, and live video rooms
                make it easy to stay close to the people who matter.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              color: "text-brand",
              title: "Privacy-first",
              body: "Granular controls let you decide exactly who sees what. Your data, your rules.",
            },
            {
              icon: LineChart,
              color: "text-pink-600",
              title: "Creator tools",
              body: "Analytics, monetization, and scheduling built for people who turn passion into income.",
            },
            {
              icon: Globe,
              color: "text-blue-600",
              title: "Global reach",
              body: "Auto-translate and cross-cultural discovery connect you with creators anywhere.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="glass-panel h-full rounded-3xl p-8 shadow-soft transition-all duration-500 hover:shadow-lift">
                <f.icon className={`mb-6 h-8 w-8 ${f.color}`} />
                <h4 className="mb-3 text-xl font-bold">{f.title}</h4>
                <p className="text-gray-600">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- community -------------------------------- */

function Community() {
  const spaces = [
    { name: "Design & Motion", members: "84k", icon: Sparkles, grad: "from-violet-500 to-pink-500" },
    { name: "Street Photography", members: "61k", icon: Zap, grad: "from-blue-500 to-cyan-500" },
    { name: "Indie Makers", members: "47k", icon: Radio, grad: "from-orange-500 to-red-500" },
  ];
  return (
    <section id="community" className="scroll-mt-24 bg-white/60 py-32">
      <div className="container mx-auto grid items-center gap-20 px-6 md:grid-cols-2">
        <Reveal className="order-2 md:order-1">
          <div className="glass-panel inline-block rotate-[-5deg] rounded-[2.5rem] p-4 shadow-lift transition-transform duration-500 hover:rotate-0">
            <div className="w-full max-w-sm space-y-4 rounded-[2rem] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="font-bold">Spaces near you</p>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                  Live
                </span>
              </div>
              {spaces.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.grad} text-white`}>
                      <s.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.members} members</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-bold transition-colors hover:border-brand hover:text-brand">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal className="order-1 space-y-6 md:order-2" delay={100}>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Spaces</p>
          <h2 className="text-4xl font-bold sm:text-5xl">
            Find your people in <span className="gradient-text">Spaces</span>
          </h2>
          <p className="text-xl text-gray-600">
            Topic-based communities with live audio rooms, events, and shared
            collections. Drop in, listen, or take the stage.
          </p>
          <ul className="space-y-4 text-gray-700">
            {[
              "Live audio rooms with up to 10k listeners",
              "Community events and shared calendars",
              "Moderation tools that keep things kind",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                  <Check className="h-3.5 w-3.5 text-brand" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 font-bold text-brand transition-all hover:gap-3"
          >
            Explore Spaces <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- creators -------------------------------- */

function Creators() {
  return (
    <section id="creators" className="scroll-mt-24 py-32">
      <div className="container mx-auto grid items-center gap-20 px-6 md:grid-cols-2">
        <Reveal className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Creators</p>
          <h2 className="text-4xl font-bold sm:text-5xl">
            Turn your passion into a <span className="gradient-text">paycheck</span>
          </h2>
          <p className="text-xl text-gray-600">
            Subscriptions, tips, and brand deals — with analytics that show
            exactly what resonates. Keep up to 95% of what you earn.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel rounded-3xl p-6 shadow-soft">
              <p className="text-3xl font-extrabold gradient-text">95%</p>
              <p className="mt-1 text-sm text-gray-500">Revenue share to creators</p>
            </div>
            <div className="glass-panel rounded-3xl p-6 shadow-soft">
              <p className="text-3xl font-extrabold gradient-text">$45M</p>
              <p className="mt-1 text-sm text-gray-500">Paid out last year</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div className="glass-panel rounded-[2.5rem] p-8 shadow-lift">
            <p className="mb-6 font-bold">Earnings overview</p>
            <div className="flex h-48 items-end gap-3">
              {[35, 55, 40, 70, 60, 85, 78, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-xl bg-gradient-to-t from-brand to-brand-pink transition-all duration-500 hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- testimonials ------------------------------ */

function Testimonials() {
  const items = [
    {
      quote:
        "Lumen changed how I share my photography. The communities here are so supportive and engaged.",
      name: "Emma Wilson",
      handle: "@emmawphoto",
      avatar: { initials: "EW", from: "from-violet-500", to: "to-pink-500" },
    },
    {
      quote:
        "The Spaces feature is incredible for networking. I've found collaborators I never would have met otherwise.",
      name: "David Park",
      handle: "@davidcreates",
      avatar: { initials: "DP", from: "from-blue-500", to: "to-cyan-500" },
    },
    {
      quote:
        "Finally a platform that respects my privacy while still letting me connect with my followers authentically.",
      name: "Priya Sharma",
      handle: "@priya.design",
      avatar: { initials: "PS", from: "from-orange-500", to: "to-red-500" },
    },
  ];
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
            Loved by <span className="gradient-text">creators</span> everywhere
          </h2>
          <p className="text-xl text-gray-600">
            Hear from the creators and communities building their lives on Lumen.
          </p>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="glass-panel h-full rounded-3xl p-8 shadow-soft transition-all duration-500 hover:shadow-lift">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="mb-6 text-gray-700">"{t.quote}"</blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar {...t.avatar} size="w-12 h-12 text-sm" ring={false} />
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.handle}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- stats ---------------------------------- */

function Stats() {
  const stats = [
    { value: 25, suffix: "M+", label: "Active Users" },
    { value: 180, suffix: "M", label: "Posts Shared Daily" },
    { value: 140, suffix: "+", label: "Countries Covered" },
    { value: 45, suffix: "M", label: "Creator Payouts", prefix: "$" },
  ];
  return (
    <section className="border-y border-gray-200 py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 gap-12 text-center md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="mb-2 text-5xl font-extrabold md:text-6xl">
                <span className="gradient-text">
                  {s.prefix}
                  <CountUp to={s.value} suffix={s.suffix} />
                </span>
              </p>
              <p className="text-sm uppercase tracking-widest text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- pricing --------------------------------- */

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    {
      name: "Free",
      tagline: "For getting started",
      monthly: 0,
      features: ["Unlimited posts & stories", "Join communities", "Basic analytics"],
      cta: "Get Started",
      style: "border border-gray-200 hover:bg-gray-50",
      popular: false,
    },
    {
      name: "Plus",
      tagline: "For growing creators",
      monthly: 9,
      features: [
        "Everything in Free",
        "Advanced analytics",
        "Monetization tools",
        "Custom branding",
      ],
      cta: "Get Started",
      style: "border border-violet-200 text-violet-700 hover:bg-violet-50",
      popular: true,
    },
    {
      name: "Pro",
      tagline: "For serious teams",
      monthly: 29,
      features: [
        "Everything in Plus",
        "Team workspaces",
        "Priority support",
        "API access",
      ],
      cta: "Contact Sales",
      style: "border border-gray-200 hover:bg-gray-50",
      popular: false,
    },
  ];
  return (
    <section id="pricing" className="scroll-mt-24 bg-white/60 py-32">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
            Simple, <span className="gradient-text">fair</span> pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free. Upgrade when you're ready to go further.
          </p>
        </Reveal>
        <div className="mb-16 flex items-center justify-center gap-4">
          <span className={`text-sm font-semibold ${!annual ? "text-gray-900" : "text-gray-500"}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing"
            className={`relative h-7 w-12 rounded-full transition-colors ${
              annual ? "bg-brand" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                annual ? "left-6" : "left-1"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold ${annual ? "text-gray-900" : "text-gray-500"}`}>
            Annual
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
              Save 20%
            </span>
          </span>
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((p, i) => {
            const price = annual ? Math.round(p.monthly * 0.8) : p.monthly;
            return (
              <Reveal key={p.name} delay={i * 100}>
                <div
                  className={`glass-panel relative flex h-full flex-col rounded-3xl p-10 ${
                    p.popular ? "shadow-glow ring-2 ring-brand/30" : "shadow-soft"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-brand-pink px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="mb-2 text-xl font-bold">{p.name}</h3>
                  <p className="mb-6 text-gray-500">{p.tagline}</p>
                  <p className="mb-8 text-5xl font-extrabold">
                    ${price}
                    <span className="text-lg font-medium text-gray-400">
                      /mo{annual && price > 0 ? ", billed annually" : ""}
                    </span>
                  </p>
                  <ul className="mb-10 flex-1 space-y-3 text-gray-700">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-brand" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/auth"
                    className={`block w-full rounded-full py-4 text-center font-bold transition-colors ${p.style}`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------ cta ---------------------------------- */

function Cta() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section id="cta" className="scroll-mt-24 px-6 py-32">
      <Reveal className="container mx-auto">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-brand via-purple-600 to-brand-pink p-10 text-center sm:p-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-8">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Ready to light up your world?
            </h2>
            <p className="text-lg text-white/80">
              Join millions of creators and communities on Lumen. Free forever,
              upgrade anytime.
            </p>
            {sent ? (
              <p className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-4 font-semibold text-white">
                <Check className="h-5 w-5" /> You're on the list — welcome to Lumen!
              </p>
            ) : (
              <form
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSent(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-14 flex-1 rounded-full bg-white/10 px-6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className="h-14 rounded-full bg-white px-8 font-bold text-violet-700 transition-colors hover:bg-gray-100"
                >
                  Get Started
                </button>
              </form>
            )}
            <p className="text-sm text-white/60">No credit card required</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------- footer --------------------------------- */

function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Spaces", "Creators", "Pricing"] },
    { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
    { title: "Resources", links: ["Help Center", "Community", "Guidelines", "Status"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
  ];
  return (
    <footer className="border-t border-gray-200 bg-white/60 pb-10 pt-20">
      <div className="container mx-auto px-6">
        <div className="mb-20 grid gap-x-16 gap-y-12 md:grid-cols-6">
          <div className="md:col-span-2">
            <p className="mb-4 text-2xl font-extrabold tracking-tight">Lumen</p>
            <p className="max-w-xs text-gray-500">
              The next-generation social platform built for creators and
              communities.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">
                {c.title}
              </p>
              <ul className="space-y-3 text-sm text-gray-500">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="transition-colors hover:text-brand">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 text-sm text-gray-400 sm:flex-row">
          <p>© 2026 Lumen. All rights reserved.</p>
          <p>Made for creators, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- page ----------------------------------- */

function Index() {
  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Nav />
      <Hero />
      <LogoCloud />
      <Features />
      <Community />
      <Creators />
      <Testimonials />
      <Stats />
      <Pricing />
      <Cta />
      <Footer />
    </div>
  );
}
