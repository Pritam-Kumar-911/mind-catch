import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  FileText, ListChecks, Lightbulb, HelpCircle, Mail,
  Save, Download, Send, Share2, Copy, Check, ChevronDown, Calendar,
  Users, Clock, Languages, TrendingUp, Sparkles,
} from "lucide-react";

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

const ACTIONS = [
  { task: "Schedule design review with onboarding team", owner: "Sara", due: "Tomorrow", priority: "high" },
  { task: "Provide test accounts for payment integration", owner: "Aisha", due: "Friday", priority: "high" },
  { task: "Move analytics dashboard to phase two backlog", owner: "Hassan", due: "This week", priority: "med" },
  { task: "Send launch comms draft to marketing", owner: "Ali", due: "Nov 10", priority: "low" },
];

const DECISIONS = [
  "Product launch confirmed for November 15th.",
  "Analytics dashboard postponed to phase two.",
  "Onboarding flow requires engineering sign-off before launch.",
  "Weekly QA syncs to begin starting next Monday.",
];

const QUIZ = [
  { q: "What is the confirmed product launch date?", a: "November 15th." },
  { q: "Which feature was moved to phase two?", a: "The analytics dashboard." },
  { q: "What does QA need by Friday?", a: "Test accounts for the payment integration." },
  { q: "Who owns the design review?", a: "Sara." },
];

const STATS = [
  { icon: Clock, label: "Duration", value: "24 min" },
  { icon: Users, label: "Speakers", value: "5" },
  { icon: ListChecks, label: "Actions", value: "4" },
  { icon: TrendingUp, label: "Confidence", value: "98%" },
];

const EMAIL = `Hi team,

Thanks for joining today's Q4 sync. Quick recap:

• Launch is locked in for November 15th.
• Onboarding flow is pending engineering sign-off — design review tomorrow.
• Analytics dashboard moves to phase two.
• Aisha will share payment test accounts by Friday.

Let me know if I missed anything.

Best,
Sara`;

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  med: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  low: "bg-brand-blue/15 text-brand-blue border-brand-blue/30",
};

function Results() {
  const [done, setDone] = useState<boolean[]>(ACTIONS.map(() => false));
  const [open, setOpen] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completed = done.filter(Boolean).length;

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-brand opacity-[0.06] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        {/* HEADER */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>April 20, 2026 · 10:30 AM</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 24 min</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Q4 Product Roadmap Sync</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-brand-soft text-xs font-semibold text-brand-purple">5 participants</span>
            <span className="px-3 py-1 rounded-full glass text-xs font-medium flex items-center gap-1.5">
              <Languages className="h-3 w-3" /> English
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
            <ResultCard icon={FileText} title="Summary" badge="AI Generated">
              <p className="text-muted-foreground leading-relaxed">
                The team aligned on Q4 priorities, with the product launch confirmed for <strong className="text-foreground">November 15th</strong>.
                The onboarding flow still needs engineering sign-off, while the analytics dashboard has been moved to phase two.
                QA flagged the need for payment integration test accounts by Friday, and a design review is scheduled for tomorrow.
              </p>
            </ResultCard>

            <ResultCard
              icon={ListChecks}
              title="Action Items"
              badge={`${completed}/${ACTIONS.length} done`}
            >
              <ul className="space-y-2">
                {ACTIONS.map((a, i) => (
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
                        <span className="text-xs text-muted-foreground">{a.owner} · due {a.due}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[a.priority]}`}>
                          {a.priority}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard icon={Lightbulb} title="Key Decisions">
              <ul className="space-y-3">
                {DECISIONS.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-accent/20">
                    <span className="font-bold text-brand-purple shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard icon={HelpCircle} title="Quiz Questions" badge={`${QUIZ.length} questions`}>
              <div className="space-y-2">
                {QUIZ.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full text-left rounded-xl bg-accent/30 hover:bg-accent/50 transition p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-sm flex gap-2"><span className="text-brand-purple">Q{i + 1}.</span> {qa.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
                    </div>
                    {open === i && (
                      <div className="mt-3 pl-7 animate-fade-in-up">
                        <p className="text-sm text-muted-foreground"><span className="text-brand-purple font-semibold">A:</span> {qa.a}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ResultCard>

            <ResultCard icon={Mail} title="Follow-up Email Draft" badge="Ready to send">
              <div className="relative">
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans bg-accent/20 rounded-xl p-5 pr-14 border border-border/40">{EMAIL}</pre>
                <button
                  onClick={copy}
                  className="absolute top-3 right-3 p-2.5 rounded-lg glass hover:bg-accent/60 transition"
                  aria-label="Copy"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </ResultCard>

            {/* Transcript */}
            <div className="gradient-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-accent/30 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand-purple" />
                  <span className="font-semibold">Full Transcript</span>
                  <span className="text-xs text-muted-foreground">· 6 turns</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showTranscript ? "rotate-180" : ""}`} />
              </button>
              {showTranscript && (
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed space-y-3 animate-fade-in-up">
                  {[
                    ["Sara", "Welcome everyone to today's product sync. Let's start with the Q4 roadmap."],
                    ["Ali", "Marketing has confirmed the launch window for November 15th, but we still need engineering sign-off on the new onboarding flow."],
                    ["Sara", "Got it. I'll schedule a review with the design team tomorrow."],
                    ["Hassan", "Quick note — the analytics dashboard needs another week before it's production ready."],
                    ["Sara", "Understood, let's move that to phase two. Any blockers from QA?"],
                    ["Aisha", "We need test accounts for the new payment integration by Friday."],
                  ].map(([who, text], i) => (
                    <p key={i}><strong className="text-gradient-brand">{who}:</strong> {text}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="gradient-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-purple" /> Participants
              </h3>
              <div className="space-y-3">
                {[
                  { n: "Sara", r: "PM", c: "from-brand-blue to-brand-purple", t: "8 min" },
                  { n: "Ali", r: "Marketing", c: "from-brand-purple to-brand-pink", t: "5 min" },
                  { n: "Hassan", r: "Engineering", c: "from-brand-pink to-brand-purple", t: "4 min" },
                  { n: "Aisha", r: "QA Lead", c: "from-brand-blue to-brand-pink", t: "4 min" },
                  { n: "Omar", r: "Design", c: "from-brand-purple to-brand-blue", t: "3 min" },
                ].map((p) => (
                  <div key={p.n} className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${p.c} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {p.n[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.n}</p>
                      <p className="text-xs text-muted-foreground">{p.r}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{p.t}</span>
                  </div>
                ))}
              </div>
            </div>

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

            <div className="gradient-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-sm">Topics covered</h3>
              <div className="flex flex-wrap gap-1.5">
                {["launch", "onboarding", "analytics", "QA", "payments", "design", "marketing", "phase 2"].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-accent/40 text-xs">#{t}</span>
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
            <Button variant="ghost" size="lg"><Send className="h-4 w-4" />Send Email</Button>
            <Button variant="brand" size="lg" className="shadow-glow"><Share2 className="h-4 w-4" />Share Link</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon, title, children, badge,
}: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode; badge?: string }) {
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
