import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mic, ListChecks, HelpCircle, Upload, ArrowRight, Sparkles, Globe2,
  Zap, Shield, Clock, Users, Star, Play, FileAudio, Brain, CheckCircle2,
  TrendingUp, BookOpen, Languages,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MeetMind — Turn Conversations Into Clarity" },
      { name: "description", content: "AI-powered meeting notes, summaries and action items generated in real time." },
      { property: "og:title", content: "MeetMind — Turn Conversations Into Clarity" },
      { property: "og:description", content: "AI-powered meeting notes, summaries and action items generated in real time." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "Live Transcription", desc: "Real-time, speaker-aware transcription in English & Urdu with 99% accuracy.", color: "from-brand-blue to-brand-purple" },
  { icon: Sparkles, title: "AI Summary", desc: "Crisp executive summaries the moment your meeting ends — no editing needed.", color: "from-brand-purple to-brand-pink" },
  { icon: ListChecks, title: "Action Items", desc: "Auto-extracted tasks with owners, deadlines, and one-click calendar sync.", color: "from-brand-blue to-brand-purple" },
  { icon: HelpCircle, title: "Quiz Generator", desc: "Turn lectures into quizzes for instant revision and exam prep.", color: "from-brand-purple to-brand-pink" },
];

const steps = [
  { n: "01", icon: Mic, title: "Record or Upload", desc: "Start a live session or drop in any MP3, MP4, WAV, or M4A file." },
  { n: "02", icon: Brain, title: "AI Processes", desc: "Our models transcribe, identify speakers, and extract meaning in seconds." },
  { n: "03", icon: FileAudio, title: "Get Your Brief", desc: "Summary, decisions, action items, quiz, and a follow-up email — ready to share." },
];

const testimonials = [
  { name: "Ayesha Khan", role: "Product Manager, Karachi", quote: "MeetMind cut my note-taking time by 90%. Action items just appear — owners and all.", initials: "AK" },
  { name: "Bilal Ahmad", role: "CS Student, LUMS", quote: "Urdu transcription is shockingly good. I review lectures in half the time now.", initials: "BA" },
  { name: "Fatima Sheikh", role: "Founder, EdTech Startup", quote: "Our investor calls now end with a polished recap email. Total game-changer.", initials: "FS" },
];

const stats = [
  { value: "99%", label: "Transcription accuracy" },
  { value: "10x", label: "Faster than manual notes" },
  { value: "40+", label: "Languages supported" },
  { value: "2M+", label: "Meetings processed" },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden noise">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-brand-purple/25 blur-3xl animate-blob" />
        <div className="absolute top-20 -right-32 h-[500px] w-[500px] rounded-full bg-brand-blue/25 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[700px] rounded-full bg-brand-pink/15 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs font-medium animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple" />
            </span>
            <span className="text-muted-foreground">New:</span>
            <span className="text-gradient-brand font-semibold">Urdu transcription is here</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>

          <h1 className="mt-8 text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight leading-[1.05] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Turn Conversations <br className="hidden sm:block" />
            Into <span className="text-gradient-brand animate-gradient">Clarity.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            AI-powered meeting notes, summaries, action items and quizzes —
            generated in real time, in <span className="text-foreground font-medium">English & Urdu</span>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="destructive" size="xl" className="shadow-glow">
              <Link to="/live">
                <span className="relative flex h-2.5 w-2.5 mr-1">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                Start Live Session
              </Link>
            </Button>
            <Button asChild variant="brand" size="xl">
              <Link to="/upload">
                <Upload className="h-5 w-5" />
                Upload Recording
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/results">
                <Play className="h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-purple" />No credit card</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-purple" />30 min free monthly</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-purple" />Bank-grade encryption</div>
          </div>

          {/* HERO MOCK DASHBOARD */}
          <div className="mt-16 mx-auto max-w-5xl animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="gradient-border rounded-3xl p-2 shadow-card relative">
              <div className="rounded-[20px] bg-surface/90 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-surface-elevated/50">
                  <span className="h-3 w-3 rounded-full bg-destructive/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                  <div className="ml-3 px-3 py-1 rounded-md bg-background/50 text-xs text-muted-foreground font-mono">meetmind.ai/live</div>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse-dot" />
                    <span className="text-destructive font-semibold">REC 12:43</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1.2fr_1fr] gap-0 text-left">
                  {/* Transcript col */}
                  <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-border/60">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Transcript</span>
                      <div className="flex gap-0.5 items-end h-3">
                        {[0.4, 0.7, 1, 0.6, 0.8].map((h, i) => (
                          <span key={i} className="w-0.5 bg-brand-purple animate-wave rounded-full" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <p className="text-muted-foreground">Let's review the Q4 roadmap before we close.</p>
                      <p className="text-muted-foreground">Marketing wants the launch by November 15th.</p>
                      <p className="text-muted-foreground">Analytics dashboard needs another week to be ready<span className="inline-block w-1.5 h-3.5 bg-brand-purple animate-pulse align-middle ml-1" /></p>
                    </div>
                  </div>
                  {/* AI col */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Notes · Live</span>
                    <div className="rounded-lg bg-gradient-brand-soft p-3 border border-border/40">
                      <p className="text-[11px] font-semibold text-brand-purple mb-1">SUMMARY</p>
                      <p className="text-xs leading-relaxed">Q4 launch confirmed for Nov 15. Analytics moved to phase 2.</p>
                    </div>
                    <div className="rounded-lg bg-accent/40 p-3">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-2">ACTION ITEMS</p>
                      <div className="space-y-1.5">
                        {["Schedule design review", "Provide test accounts"].map((a) => (
                          <div key={a} className="flex items-center gap-2 text-xs">
                            <span className="h-3.5 w-3.5 rounded border border-muted-foreground/40 shrink-0" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-border/50 rounded-2xl overflow-hidden glass">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface/60 px-4 py-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient-brand">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-gradient-brand-soft text-xs font-semibold text-brand-purple mb-4">FEATURES</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Everything you need,<br className="sm:hidden" /> automatically.</h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            From the first word to the final follow-up email — MeetMind handles every step.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl gradient-border p-6 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-glow animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-glow`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="mt-5 flex items-center text-xs font-medium text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlight band */}
        <div className="mt-20 grid lg:grid-cols-2 gap-6">
          <div className="gradient-border rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <Languages className="absolute -bottom-6 -right-6 h-40 w-40 text-brand-purple/10" />
            <div className="relative">
              <div className="inline-flex h-11 w-11 rounded-xl bg-gradient-brand items-center justify-center mb-5">
                <Languages className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Bilingual by design.</h3>
              <p className="mt-3 text-muted-foreground">
                Switch between English and Urdu — or transcribe both at once. Built for South Asian classrooms and boardrooms.
              </p>
              <div className="mt-6 flex gap-2 flex-wrap">
                {["English", "اردو", "Hinglish", "Code-switch"].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full glass text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="gradient-border rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <Shield className="absolute -bottom-6 -right-6 h-40 w-40 text-brand-blue/10" />
            <div className="relative">
              <div className="inline-flex h-11 w-11 rounded-xl bg-gradient-brand items-center justify-center mb-5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Private & secure.</h3>
              <p className="mt-3 text-muted-foreground">
                End-to-end encryption, no training on your data, and full GDPR compliance. Your meetings stay yours.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Shield, t: "E2E" },
                  { icon: Zap, t: "SOC 2" },
                  { icon: Clock, t: "30-day" },
                ].map((b) => (
                  <div key={b.t} className="rounded-lg bg-accent/40 py-3">
                    <b.icon className="h-4 w-4 mx-auto text-brand-purple" />
                    <p className="mt-1 text-xs font-medium">{b.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border/40 bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-gradient-brand-soft text-xs font-semibold text-brand-purple mb-4">HOW IT WORKS</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Three steps to clarity.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {steps.map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="relative mx-auto h-24 w-24 rounded-2xl glass-strong flex items-center justify-center mb-5">
                  <s.icon className="h-9 w-9 text-brand-purple" />
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-brand text-white text-xs font-bold flex items-center justify-center shadow-glow">{s.n}</span>
                </div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-gradient-brand-soft text-xs font-semibold text-brand-purple mb-4">LOVED BY USERS</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">From classrooms to boardrooms.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={t.name} className="gradient-border rounded-2xl p-6 hover:-translate-y-1 transition-transform animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-brand-purple text-brand-purple" />)}
              </div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border/40">
                <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold">{t.initials}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT / STATS BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden gradient-border p-10 sm:p-16 text-center noise">
          <div className="absolute inset-0 bg-gradient-brand opacity-[0.08]" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-purple/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium mb-6">
              <TrendingUp className="h-3.5 w-3.5 text-brand-purple" />
              The problem we're solving
            </div>
            <p className="text-3xl sm:text-5xl font-bold max-w-4xl mx-auto leading-tight tracking-tight">
              <span className="text-gradient-brand">50M+ students in Pakistan</span> miss critical lecture content every day.
            </p>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              MeetMind makes sure no insight, decision or assignment is ever lost again — in any language, on any device.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="brand" size="xl" className="shadow-glow">
                <Link to="/upload">Try MeetMind Free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/live"><BookOpen className="h-4 w-4" /> Read the story</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Joined by 12,000+ learners this month
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">MeetMind</span>
            </div>
            <p className="text-sm text-muted-foreground">AI meeting intelligence built for the next generation.</p>
          </div>
          {[
            { t: "Product", links: ["Live Session", "Upload", "Results", "Pricing"] },
            { t: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { t: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
          ].map((c) => (
            <div key={c.t}>
              <p className="text-sm font-semibold mb-3">{c.t}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => <li key={l} className="hover:text-foreground cursor-pointer transition">{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MeetMind · Built with <Globe2 className="inline h-3 w-3 text-brand-purple" /> for clarity.
        </div>
      </footer>
    </div>
  );
}
