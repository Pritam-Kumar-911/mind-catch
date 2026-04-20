import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Square, Mic, StopCircle, Volume2, Pause, Play, Settings,
  MessageSquare, Sparkles, ListChecks, Target, HelpCircle, Download,
  Languages, Wifi,
} from "lucide-react";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Session — MeetMind" },
      { name: "description", content: "Real-time transcription with AI notes, action items and quizzes." },
      { property: "og:title", content: "Live Session — MeetMind" },
      { property: "og:description", content: "Real-time transcription with AI notes." },
    ],
  }),
  component: LiveSession,
});

const SCRIPT = `Welcome to today's product sync. Let's start with the Q4 roadmap. Marketing has confirmed the launch window for November 15th, but we still need engineering sign-off on the new onboarding flow. We'll schedule a review with the design team tomorrow. Quick note — the analytics dashboard needs another week before it's production ready, so let's move that to phase two. From the QA side, we need test accounts for the new payment integration by Friday.`.split(" ");

function LiveSession() {
  const [words, setWords] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    let i = words.length;
    const id = setInterval(() => {
      if (i < SCRIPT.length) {
        setWords((w) => [...w, SCRIPT[i]]);
        i++;
      }
    }, 220);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { clearInterval(id); clearInterval(t); };
  }, [paused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [words]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Recording bar */}
      <div className="sticky top-16 z-40 glass-strong border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/15 border border-destructive/30">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse-dot" />
              <span className="font-semibold text-destructive text-sm">RECORDING</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono tabular-nums">{mm}:{ss}</span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wifi className="h-3.5 w-3.5 text-green-500" /> Connection strong
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs">
              <Languages className="h-3.5 w-3.5 text-brand-purple" />
              <span>EN · UR</span>
            </div>
            <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-[1400px] w-full px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 h-[calc(100vh-260px)] min-h-[520px]">
          {/* TRANSCRIPT */}
          <div className="gradient-border rounded-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-purple" />
                <h2 className="font-semibold">Live Transcript</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 items-end h-3">
                  {[0.4, 0.7, 1, 0.6, 0.8, 0.5].map((h, i) => (
                    <span key={i} className={`w-0.5 bg-brand-purple rounded-full ${paused ? "" : "animate-wave"}`} style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{words.length} words</span>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 leading-relaxed text-[15px]">
              {words.map((w, i) => (
                <span key={i} className="animate-fade-in-up" style={{ animationDuration: "0.4s" }}>
                  {w}{" "}
                </span>
              ))}
              {!paused && <span className="inline-block w-2 h-5 bg-brand-purple align-middle animate-pulse" />}
            </div>
            <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Volume2 className="h-3.5 w-3.5 text-brand-purple" />
                Auto-detecting language
              </div>
              <button className="flex items-center gap-1 hover:text-foreground transition">
                <Download className="h-3.5 w-3.5" /> Save .txt
              </button>
            </div>
          </div>

          {/* AI NOTES */}
          <div className="gradient-border rounded-2xl flex flex-col overflow-hidden">
            <Tabs defaultValue="summary" className="flex flex-col h-full">
              <div className="px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-brand-purple" />
                  <h2 className="font-semibold">AI Notes</h2>
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-brand text-white">LIVE</span>
                </div>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="summary" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /><span className="hidden sm:inline">Summary</span></TabsTrigger>
                  <TabsTrigger value="actions" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></TabsTrigger>
                  <TabsTrigger value="key" className="gap-1.5"><Target className="h-3.5 w-3.5" /><span className="hidden sm:inline">Key</span></TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-1.5"><HelpCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">Quiz</span></TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <TabsContent value="summary" className="mt-0 space-y-4 text-sm">
                  <div className="rounded-xl bg-gradient-brand-soft p-4 border border-border/40">
                    <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider mb-2">Executive Summary</p>
                    <p className="leading-relaxed">The team aligned on a Q4 roadmap with a confirmed launch on <span className="font-semibold">November 15th</span>.</p>
                  </div>
                  <div className="rounded-xl bg-accent/30 p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Context</p>
                    <p className="text-muted-foreground leading-relaxed">Engineering still needs to sign off on the onboarding flow, and the analytics dashboard has been moved to phase two.</p>
                  </div>
                </TabsContent>
                <TabsContent value="actions" className="mt-0 space-y-2">
                  {[
                    { t: "Schedule design review with onboarding team", d: "Tomorrow" },
                    { t: "Provide test accounts for payment integration", d: "Friday" },
                    { t: "Move analytics dashboard to phase two backlog", d: "This week" },
                    { t: "Send launch comms draft to marketing", d: "Nov 10" },
                  ].map((a, i) => (
                    <label key={i} className="flex gap-3 items-start p-3 rounded-lg hover:bg-accent/40 cursor-pointer transition group">
                      <Square className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-brand-purple transition" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{a.t}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">due {a.d}</p>
                      </div>
                    </label>
                  ))}
                </TabsContent>
                <TabsContent value="key" className="mt-0 space-y-2 text-sm">
                  {[
                    "Launch confirmed for November 15",
                    "Analytics deferred to phase 2",
                    "QA needs payment test accounts by Friday",
                    "Design review scheduled for tomorrow",
                  ].map((k, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-accent/30">
                      <span className="text-brand-purple font-bold">{String(i + 1).padStart(2, "0")}</span>
                      <span>{k}</span>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="quiz" className="mt-0 space-y-2">
                  {[
                    { q: "What is the confirmed launch date?", a: "November 15th" },
                    { q: "Which feature was moved to phase two?", a: "The analytics dashboard" },
                    { q: "What does QA need by Friday?", a: "Test accounts for the payment integration" },
                  ].map((qa, i) => (
                    <details key={i} className="group rounded-lg bg-accent/30 hover:bg-accent/50 p-4 transition">
                      <summary className="cursor-pointer text-sm font-medium list-none flex items-start gap-2">
                        <span className="text-brand-purple shrink-0">Q{i + 1}.</span>
                        <span>{qa.q}</span>
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground pl-7">{qa.a}</p>
                    </details>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="mt-6 glass-strong rounded-2xl p-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            <Mic className="h-4 w-4 text-brand-purple" />
            Mic active · Auto-captioning enabled
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="glass" size="lg"><Pause className="h-4 w-4" /> Pause</Button>
            <Button asChild variant="destructive" size="lg" className="shadow-glow">
              <Link to="/results">
                <StopCircle className="h-5 w-5" /> End Session
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
