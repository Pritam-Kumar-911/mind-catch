import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  FileText, ListChecks, Lightbulb, HelpCircle, Mail,
  Save, Download, Send, Share2, Copy, Check, ChevronDown, Calendar
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
  { task: "Schedule design review with onboarding team", owner: "Sara", due: "Tomorrow" },
  { task: "Provide test accounts for payment integration", owner: "Aisha", due: "Friday" },
  { task: "Move analytics dashboard to phase two backlog", owner: "Hassan", due: "This week" },
  { task: "Send launch comms draft to marketing", owner: "Ali", due: "Nov 10" },
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

const EMAIL = `Hi team,

Thanks for joining today's Q4 sync. Quick recap:

• Launch is locked in for November 15th.
• Onboarding flow is pending engineering sign-off — design review tomorrow.
• Analytics dashboard moves to phase two.
• Aisha will share payment test accounts by Friday.

Let me know if I missed anything.

Best,
Sara`;

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

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>April 20, 2026 · 10:30 AM · 24 min</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Q4 Product Roadmap Sync</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-brand-soft text-xs font-medium">5 participants</span>
            <span className="px-3 py-1 rounded-full bg-accent/50 text-xs font-medium">English</span>
            <span className="px-3 py-1 rounded-full bg-accent/50 text-xs font-medium">High confidence</span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 space-y-6">
          <ResultCard icon={FileText} title="Summary">
            <p className="text-muted-foreground leading-relaxed">
              The team aligned on Q4 priorities, with the product launch confirmed for <strong className="text-foreground">November 15th</strong>.
              The onboarding flow still needs engineering sign-off, while the analytics dashboard has been moved to phase two.
              QA flagged the need for payment integration test accounts by Friday, and a design review is scheduled for tomorrow.
            </p>
          </ResultCard>

          <ResultCard icon={ListChecks} title="Action Items">
            <ul className="space-y-2">
              {ACTIONS.map((a, i) => (
                <li
                  key={i}
                  onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/40 cursor-pointer transition"
                >
                  <span className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                    done[i] ? "bg-gradient-brand border-transparent" : "border-muted-foreground/40"
                  }`}>
                    {done[i] && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${done[i] ? "line-through text-muted-foreground" : ""}`}>{a.task}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.owner} · due {a.due}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ResultCard>

          <ResultCard icon={Lightbulb} title="Key Decisions">
            <ul className="space-y-2">
              {DECISIONS.map((d, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-brand-purple shrink-0">▸</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </ResultCard>

          <ResultCard icon={HelpCircle} title="Quiz Questions">
            <div className="space-y-2">
              {QUIZ.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left rounded-lg bg-accent/30 hover:bg-accent/50 transition p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-sm">Q{i + 1}. {qa.q}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
                  </div>
                  {open === i && <p className="mt-2 text-sm text-muted-foreground animate-fade-in-up">{qa.a}</p>}
                </button>
              ))}
            </div>
          </ResultCard>

          <ResultCard icon={Mail} title="Follow-up Email Draft">
            <div className="relative">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans bg-accent/20 rounded-lg p-4 pr-14">{EMAIL}</pre>
              <button
                onClick={copy}
                className="absolute top-3 right-3 p-2 rounded-lg glass hover:bg-accent/50 transition"
                aria-label="Copy"
              >
                {copied ? <Check className="h-4 w-4 text-brand-purple" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </ResultCard>
        </div>

        {/* Transcript */}
        <div className="mt-6 glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/30 transition"
          >
            <span className="font-semibold">Full Transcript</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${showTranscript ? "rotate-180" : ""}`} />
          </button>
          {showTranscript && (
            <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed space-y-3 animate-fade-in-up">
              <p><strong className="text-gradient-brand">Sara:</strong> Welcome everyone to today's product sync. Let's start with the Q4 roadmap.</p>
              <p><strong className="text-gradient-brand">Ali:</strong> Marketing has confirmed the launch window for November 15th, but we still need engineering sign-off on the new onboarding flow.</p>
              <p><strong className="text-gradient-brand">Sara:</strong> Got it. I'll schedule a review with the design team tomorrow.</p>
              <p><strong className="text-gradient-brand">Hassan:</strong> Quick note — the analytics dashboard needs another week before it's production ready.</p>
              <p><strong className="text-gradient-brand">Sara:</strong> Understood, let's move that to phase two. Any blockers from QA?</p>
              <p><strong className="text-gradient-brand">Aisha:</strong> We need test accounts for the new payment integration by Friday.</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 sticky bottom-4 z-40">
          <div className="glass rounded-2xl p-3 flex flex-wrap gap-2 justify-center sm:justify-end shadow-card">
            <Button variant="ghost" size="lg"><Save className="h-4 w-4" />Save</Button>
            <Button variant="ghost" size="lg"><Download className="h-4 w-4" />Export PDF</Button>
            <Button variant="ghost" size="lg"><Send className="h-4 w-4" />Send Email</Button>
            <Button variant="brand" size="lg"><Share2 className="h-4 w-4" />Share Link</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon, title, children,
}: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 sm:p-7 hover:shadow-card transition-shadow animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
