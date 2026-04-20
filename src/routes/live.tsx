import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Square, Mic, StopCircle } from "lucide-react";

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

const SCRIPT = `Sara: Welcome everyone to today's product sync. Let's start with the Q4 roadmap. Ali: Marketing has confirmed the launch window for November 15th, but we still need engineering sign-off on the new onboarding flow. Sara: Got it. I'll schedule a review with the design team tomorrow. Hassan: Quick note — the analytics dashboard needs another week before it's production ready. Sara: Understood, let's move that to phase two. Any blockers from QA? Aisha: We need test accounts for the new payment integration by Friday.`.split(" ");

function LiveSession() {
  const [words, setWords] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < SCRIPT.length) {
        setWords((w) => [...w, SCRIPT[i]]);
        i++;
      }
    }, 220);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { clearInterval(id); clearInterval(t); };
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Recording bar */}
      <div className="sticky top-16 z-40 glass border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-destructive animate-pulse-dot" />
            <span className="font-semibold text-destructive">Recording...</span>
            <span className="hidden sm:inline text-sm text-muted-foreground font-mono">{mm}:{ss}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mic className="h-4 w-4 text-brand-purple" />
            <span className="hidden sm:inline">Mic active · Auto-captioning</span>
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Transcript */}
          <div className="glass rounded-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
              <h2 className="font-semibold">Live Transcript</h2>
              <span className="text-xs text-muted-foreground">{words.length} words</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 leading-relaxed text-[15px]">
              {words.map((w, i) => (
                <span key={i} className="animate-fade-in-up" style={{ animationDuration: "0.4s" }}>
                  {w.endsWith(":") ? <strong className="text-gradient-brand">{w} </strong> : <>{w} </>}
                </span>
              ))}
              <span className="inline-block w-2 h-5 bg-brand-purple align-middle animate-pulse" />
            </div>
          </div>

          {/* AI Notes */}
          <div className="glass rounded-2xl flex flex-col overflow-hidden">
            <Tabs defaultValue="summary" className="flex flex-col h-full">
              <div className="px-5 py-4 border-b border-border/60">
                <h2 className="font-semibold mb-3">AI Notes</h2>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="key">Key Points</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <TabsContent value="summary" className="mt-0 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>The team aligned on a Q4 roadmap with a confirmed launch on <span className="text-foreground font-medium">November 15th</span>.</p>
                  <p>Engineering still needs to sign off on the onboarding flow, and the analytics dashboard has been moved to phase two.</p>
                </TabsContent>
                <TabsContent value="actions" className="mt-0 space-y-3">
                  {[
                    "Schedule design review with onboarding team",
                    "Provide test accounts for payment integration by Friday",
                    "Move analytics dashboard to phase two backlog",
                    "Send launch comms draft to marketing",
                  ].map((a, i) => (
                    <label key={i} className="flex gap-3 items-start p-3 rounded-lg hover:bg-accent/40 cursor-pointer transition">
                      <Square className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-sm">{a}</span>
                    </label>
                  ))}
                </TabsContent>
                <TabsContent value="key" className="mt-0 space-y-2 text-sm">
                  {["Launch confirmed for Nov 15", "Analytics deferred to phase 2", "QA needs payment test accounts", "Design review tomorrow"].map((k, i) => (
                    <div key={i} className="flex gap-2"><span className="text-brand-purple">▸</span><span>{k}</span></div>
                  ))}
                </TabsContent>
                <TabsContent value="quiz" className="mt-0 space-y-3">
                  {[
                    { q: "What is the confirmed launch date?", a: "November 15th" },
                    { q: "Which feature was moved to phase two?", a: "The analytics dashboard" },
                    { q: "What does QA need by Friday?", a: "Test accounts for the payment integration" },
                  ].map((qa, i) => (
                    <details key={i} className="group rounded-lg bg-accent/30 p-3">
                      <summary className="cursor-pointer text-sm font-medium">Q{i + 1}. {qa.q}</summary>
                      <p className="mt-2 text-sm text-muted-foreground">{qa.a}</p>
                    </details>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild variant="destructive" size="xl">
            <Link to="/results">
              <StopCircle className="h-5 w-5" />
              End Session
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
