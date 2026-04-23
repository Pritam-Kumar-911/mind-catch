import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  FileText, ListChecks, Lightbulb, HelpCircle, Mail,
  Save, Download, Send, Share2, Copy, Check, ChevronDown, Calendar,
  Clock, Languages, TrendingUp, Sparkles, Brain,
} from "lucide-react";
import type { MeetingResults } from "@/api";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Meeting Results — MeetMind" },
      { name: "description", content: "AI-generated summary, action items, decisions and quiz from your meeting." },
      { property: "og:title", content: "Meeting Results — MeetMind" },
      { property: "og:description", content: "Your AI-generated meeting brief." },
    ],
  }),
  component: Results,
});

// ── Fallback demo data (shown when no real results yet) ───────────────────────
const DEMO: MeetingResults = {
  success: true,
  transcript: "Welcome to today's product sync. Let's start with the Q4 roadmap. Marketing has confirmed the launch window for November 15th, but we still need engineering sign-off on the new onboarding flow. We'll schedule a review with the design team tomorrow. Quick note — the analytics dashboard needs another week before it's production ready, so let's move that to phase two. From the QA side, we need test accounts for the new payment integration by Friday.",
  wordCount: 3840,
  language: "en-US",
  summary: "The team aligned on Q4 priorities, with the product launch confirmed for November 15th. The onboarding flow still needs engineering sign-off, while the analytics dashboard has been moved to phase two. QA flagged the need for payment integration test accounts by Friday, and a design review is scheduled for tomorrow.",
  actionItems: [
    { task: "Schedule design review with onboarding team", owner: "Team", due: "Tomorrow" },
    { task: "Provide test accounts for payment integration", owner: "QA", due: "Friday" },
    { task: "Move analytics dashboard to phase two backlog", owner: "Engineering", due: "This week" },
    { task: "Send launch comms draft to marketing", owner: "Marketing", due: "Nov 10" },
  ],
  keyDecisions: [
    "Product launch confirmed for November 15th.",
    "Analytics dashboard postponed to phase two.",
    "Onboarding flow requires engineering sign-off before launch.",
    "Weekly QA syncs to begin starting next Monday.",
  ],
  keyPoints: [
    "Launch date locked: November 15th",
    "Analytics dashboard moved to phase 2",
    "QA needs test accounts by Friday",
    "Design review scheduled for tomorrow",
  ],
  quiz: [
    { question: "What is the confirmed product launch date?", answer: "November 15th." },
    { question: "Which feature was moved to phase two?", answer: "The analytics dashboard." },
    { question: "What does QA need by Friday?", answer: "Test accounts for the payment integration." },
    { question: "What was scheduled for tomorrow?", answer: "A design review with the onboarding team." },
  ],
  emailDraft: `Hi team,\n\nThanks for the Q4 sync today. Quick recap:\n\n• Launch is locked in for November 15th.\n• Onboarding flow is pending engineering sign-off — design review tomorrow.\n• Analytics dashboard moves to phase two.\n• Payment integration test accounts to be shared by Friday.\n\nLet me know if anything was missed.\n\nBest`,
};

const PRIORITY_MAP = ["high", "med", "low", "low"];
const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  med: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  low: "bg-brand-blue/15 text-brand-blue border-brand-blue/30",
};

function Results() {
  // ── Load real results or fall back to demo data ───────────────────────────
  const [data, setData] = useState<MeetingResults>(DEMO);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("meetingResults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        setIsDemo(false);
      } catch {
        // fallback to demo
      }
    }
  }, []);

  const [done, setDone] = useState<boolean[]>([]);
  const [open, setOpen] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Reset checkboxes when data changes
  useEffect(() => {
    setDone(data.actionItems.map(() => false));
  }, [data]);

  const copy = () => {
    navigator.clipboard.writeText(data.emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completed = done.filter(Boolean).length;

  const STATS = [
    { icon: Clock, label: "Duration", value: `~${Math.ceil(data.wordCount / 150)} min` },
    { icon: FileText, label: "Words", value: data.wordCount.toLocaleString() },
    { icon: ListChecks, label: "Actions", value: String(data.actionItems.length) },
    { icon: TrendingUp, label: "Confidence", value: "98%" },
  ];

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-brand opacity-[0.06] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">

        {/* Demo banner */}
        {isDemo && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 shrink-0" />
            <span>Showing demo results — upload a recording to see your real AI analysis!</span>
          </div>
        )}

        {/* HEADER */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> ~{Math.ceil(data.wordCount / 150)} min
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {isDemo ? "Q4 Product Roadmap Sync" : "Meeting Results"}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full glass text-xs font-medium flex items-center gap-1.5">
              <Languages className="h-3 w-3" />
              {data.language === "ur-PK" ? "Urdu" : data.language === "both" ? "English & Urdu" : "English"}
            </span>
            <span className="px-3 py-1 rounded-full glass text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-brand-purple" /> AI processed
            </span>
            <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 text-xs font-medium border border-green-500/30">
              98% confidence
            </span>
          </div>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden gradient-border">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface/60 px-5 py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-brand-purple" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">

            {/* Summary */}
            <ResultCard icon={FileText} title="Summary" badge="AI Generated">
              <p className="text-muted-foreground leading-relaxed">{data.summary}</p>
            </ResultCard>

            {/* Action Items */}
            <ResultCard icon={ListChecks} title="Action Items" badge={`${completed}/${data.actionItems.length} done`}>
              <ul className="space-y-2">
                {data.actionItems.map((a, i) => (
                  <li
                    key={i}
                    onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                    className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-accent/40 cursor-pointer transition group"
                  >
                    <span className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                      done[i] ? "bg-gradient-brand border-transparent" : "border-muted-foreground/40 group-hover:border-brand-purple"
                    }`}>
                      {done[i] && <Check className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${done[i] ? "line-through text-muted-foreground" : ""}`}>{a.task}</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {a.owner && <span className="text-xs text-brand-purple font-medium">@{a.owner}</span>}
                        <span className="text-xs text-muted-foreground">due {a.due}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[PRIORITY_MAP[i] ?? "low"]}`}>
                          {PRIORITY_MAP[i] ?? "low"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ResultCard>

            {/* Key Decisions */}
            <ResultCard icon={Lightbulb} title="Key Decisions">
              <ul className="space-y-3">
                {data.keyDecisions.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-accent/20">
                    <span className="font-bold text-brand-purple shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </ResultCard>

            {/* Quiz */}
            <ResultCard icon={HelpCircle} title="Quiz Questions" badge={`${data.quiz.length} questions`}>
              <div className="space-y-2">
                {data.quiz.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full text-left rounded-xl bg-accent/30 hover:bg-accent/50 transition p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-sm flex gap-2">
                        <span className="text-brand-purple">Q{i + 1}.</span> {qa.question}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
                    </div>
                    {open === i && (
                      <div className="mt-3 pl-7 animate-fade-in-up">
                        <p className="text-sm text-muted-foreground">
                          <span className="text-brand-purple font-semibold">A:</span> {qa.answer}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ResultCard>

            {/* Email Draft */}
            <ResultCard icon={Mail} title="Follow-up Email Draft" badge="Ready to send">
              <div className="relative">
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans bg-accent/20 rounded-xl p-5 pr-14 border border-border/40">
                  {data.emailDraft}
                </pre>
                <button
                  onClick={copy}
                  className="absolute top-3 right-3 p-2.5 rounded-lg glass hover:bg-accent/60 transition"
                  aria-label="Copy"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </ResultCard>

            {/* Full Transcript */}
            <div className="gradient-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-accent/30 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand-purple" />
                  <span className="font-semibold">Full Transcript</span>
                  <span className="text-xs text-muted-foreground">· {data.wordCount.toLocaleString()} words</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showTranscript ? "rotate-180" : ""}`} />
              </button>
              {showTranscript && (
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed animate-fade-in-up">
                  {data.transcript}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="gradient-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-purple" /> Sentiment
              </h3>
              <div className="space-y-2.5">
                {[
                  { l: "Positive", v: 62, c: "bg-green-500" },
                  { l: "Neutral", v: 32, c: "bg-brand-blue" },
                  { l: "Concern", v: 6, c: "bg-yellow-500" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{s.l}</span>
                      <span className="font-mono">{s.v}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent/50 overflow-hidden">
                      <div className={`h-full ${s.c} transition-all`} style={{ width: `${s.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Points */}
            <div className="gradient-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-purple" /> Key Points
              </h3>
              <ul className="space-y-2">
                {data.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-brand-purple font-bold shrink-0">·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Topics */}
            <div className="gradient-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-sm">Topics covered</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.keyPoints.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-accent/40 text-xs">
                    #{p.split(" ")[0].toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* STICKY ACTION BAR */}
        <div className="mt-8 sticky bottom-4 z-40">
          <div className="glass-strong rounded-2xl p-3 flex flex-wrap gap-2 justify-center sm:justify-end shadow-card border border-border/60">
            <Button variant="ghost" size="lg"><Save className="h-4 w-4" />Save</Button>
            <Button variant="ghost" size="lg"><Download className="h-4 w-4" />Export PDF</Button>
            <Button variant="ghost" size="lg" onClick={copy}><Send className="h-4 w-4" />Copy Email</Button>
            <Button variant="brand" size="lg" className="shadow-glow"><Share2 className="h-4 w-4" />Share Link</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon, title, children, badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="gradient-border rounded-2xl p-6 sm:p-7 hover:shadow-card transition-shadow animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-glow">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold flex-1">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-brand-soft text-brand-purple border border-brand-purple/20">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
