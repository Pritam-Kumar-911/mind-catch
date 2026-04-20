import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Mic, ListChecks, HelpCircle, Upload, Circle, ArrowRight, Sparkles, Globe2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MeetMind — Never Miss a Word Again" },
      { name: "description", content: "AI-powered meeting notes, summaries and action items generated in real time." },
      { property: "og:title", content: "MeetMind — Never Miss a Word Again" },
      { property: "og:description", content: "AI-powered meeting notes, summaries and action items generated in real time." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "Live Transcription", desc: "Real-time, speaker-aware transcription in English & Urdu." },
  { icon: Sparkles, title: "AI Summary", desc: "Crisp summaries the moment your meeting ends." },
  { icon: ListChecks, title: "Action Items", desc: "Auto-extracted tasks with owners and deadlines." },
  { icon: HelpCircle, title: "Quiz Generator", desc: "Turn lectures into quizzes for instant revision." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-brand-purple/30 blur-3xl animate-blob" />
        <div className="absolute top-20 -right-20 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
            AI Meeting Intelligence — now in beta
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Never Miss a <br className="hidden sm:block" />
            <span className="text-gradient-brand">Word Again</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            AI-powered meeting notes, summaries and action items generated in real time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="destructive" size="xl">
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
          </div>

          {/* Floating mock card */}
          <div className="mt-20 mx-auto max-w-4xl animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="glass rounded-2xl p-1.5 shadow-card">
              <div className="rounded-xl bg-surface/80 p-6 sm:p-8 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse-dot" />
                  <span className="text-xs font-medium text-destructive">REC 12:43</span>
                  <span className="ml-auto text-xs text-muted-foreground">Live transcript</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  <span className="text-foreground">Sara:</span> Let's review the Q4 roadmap before we close.{" "}
                  <span className="text-foreground">Ali:</span> Marketing wants the launch by November 15th.{" "}
                  <span className="inline-block w-2 h-4 bg-brand-purple animate-pulse align-middle ml-1" />
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {["Summary", "Action Items", "Quiz"].map((t) => (
                    <div key={t} className="rounded-lg bg-accent/40 py-2.5 text-xs font-medium">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Everything you need, automatically.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">From the first word to final follow-up — MeetMind handles it.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl glass p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-glow"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-brand-soft glass p-10 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-brand opacity-10" />
          <Globe2 className="relative mx-auto h-10 w-10 text-brand-purple mb-4" />
          <p className="relative text-2xl sm:text-4xl font-bold max-w-3xl mx-auto leading-tight">
            <span className="text-gradient-brand">50M+ students in Pakistan</span> miss critical lecture content every day.
          </p>
          <p className="relative mt-4 text-muted-foreground max-w-xl mx-auto">
            MeetMind makes sure no insight, decision or assignment is ever lost again.
          </p>
          <div className="relative mt-8">
            <Button asChild variant="brand" size="lg">
              <Link to="/upload">Try MeetMind Free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MeetMind · Built for clarity.
      </footer>
    </div>
  );
}
