import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getLiveUpdate, analyzeText } from "@/api";
import type { LiveUpdate } from "@/api";
import {
  Square, Mic, StopCircle, Volume2, Pause, Play, Settings,
  MessageSquare, Sparkles, ListChecks, Target, HelpCircle, Download,
  Languages, Wifi, WifiOff, Monitor,
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

type CaptureMode = "idle" | "mic" | "tab";

// ── Subtitle line type ────────────────────────────────────────────────────────
interface SubtitleLine {
  id: number;
  text: string;
  fresh: boolean; // true = just appeared (highlighted)
}

function LiveSession() {
  const navigate = useNavigate();

  // ── Session state ──────────────────────────────────────────────────────────
  const [mode, setMode] = useState<CaptureMode>("idle");
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [subtitleLines, setSubtitleLines] = useState<SubtitleLine[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── AI Notes state ─────────────────────────────────────────────────────────
  const [aiNotes, setAiNotes] = useState<LiveUpdate | null>(null);
  const [aiUpdating, setAiUpdating] = useState(false);
  const [lastUpdateAt, setLastUpdateAt] = useState(0);
  const [nextUpdateIn, setNextUpdateIn] = useState(60);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleIdRef = useRef(0);
  const transcriptRef = useRef("");
  const pausedRef = useRef(false);
  const modeRef = useRef<CaptureMode>("idle");

  // Keep refs in sync
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "idle" || paused) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setNextUpdateIn((n) => Math.max(0, n - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, paused]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [subtitleLines, interimText]);

  // ── AI update every 60 seconds ─────────────────────────────────────────────
  useEffect(() => {
    if (mode === "idle" || paused) return;
    if (nextUpdateIn === 0 && transcript.split(" ").length > 10) {
      triggerAiUpdate();
      setNextUpdateIn(60);
    }
  }, [nextUpdateIn]);

  const triggerAiUpdate = useCallback(async () => {
    if (!transcriptRef.current || aiUpdating) return;
    setAiUpdating(true);
    try {
      const update = await getLiveUpdate(transcriptRef.current);
      setAiNotes(update);
      setLastUpdateAt(seconds);
    } catch (e) {
      console.error("AI update failed:", e);
    } finally {
      setAiUpdating(false);
    }
  }, [aiUpdating, seconds]);

  // ── Add subtitle line helper ───────────────────────────────────────────────
  const addSubtitleLine = useCallback((text: string) => {
    if (!text.trim()) return;
    const id = ++subtitleIdRef.current;
    setSubtitleLines((lines) => {
      const updated = [...lines, { id, text: text.trim(), fresh: true }];
      // Keep last 50 lines max
      return updated.slice(-50);
    });
    setTranscript((t) => t + text + " ");
    // Remove "fresh" highlight after 2s
    setTimeout(() => {
      setSubtitleLines((lines) =>
        lines.map((l) => l.id === id ? { ...l, fresh: false } : l)
      );
    }, 2000);
  }, []);

  // ── MIC MODE: Web Speech API (instant) ────────────────────────────────────
  const startMic = async () => {
    try {
      setError(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("Speech recognition not supported. Please use Chrome.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            addSubtitleLine(text);
            setInterimText("");
          } else {
            interim += text;
          }
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
  console.log("⚠️ Recognition error:", event.error);
  // Don't show error for these — they're normal
  if (event.error === "no-speech" || 
      event.error === "audio-capture" ||
      event.error === "aborted") {
    return;
  }
  setError(`Mic error: ${event.error}`);
};

recognition.onend = () => {
  console.log("🔄 Recognition ended, restarting...");
  if (!pausedRef.current && modeRef.current === "mic") {
    setTimeout(() => {
      try {
        recognition.start();
        console.log("✅ Restarted successfully");
      } catch (e) {
        // Already started, ignore
      }
    }, 200);
  }
};

      recognitionRef.current = recognition;
      recognition.start();
      setMode("mic");
      setConnected(true);

    } catch (err: any) {
      setError("Microphone access denied. Please allow microphone in browser settings.");
    }
  };

  // ── TAB MODE: MediaRecorder → Backend STT (2s chunks = subtitle feel) ──────
  const startTabCapture = async () => {
    try {
      setError(null);

      // Ask user to share a tab (audio only if possible)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // required by browser even if we only want audio
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 16000,
        } as any,
      });

      // Check audio tracks exist
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setError("No audio detected from tab. Make sure to check 'Share tab audio' when prompted.");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Create audio-only stream for recording
      const audioStream = new MediaStream(audioTracks);
      streamRef.current = stream;

      // Pick best supported format
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        console.log("📦 Chunk fired! size:", event.data.size);
        if (event.data.size < 1000) {
          console.log("⚠️ Too small, skipping");
          return;
        }
        if (pausedRef.current) return;

        console.log("📤 Sending to backend...");
        const formData = new FormData();
        formData.append("chunk", event.data, "chunk.webm");

        try {
          const res = await fetch("http://localhost:3001/api/transcribe-chunk", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          console.log("✅ Backend response:", data);
          if (data.transcript) {
            addSubtitleLine(data.transcript);
          }
        } catch (e) {
          console.error("❌ Chunk upload failed:", e);
        }
      };

      mediaRecorder.onstart = () => console.log("🎬 MediaRecorder started!");
      mediaRecorder.onerror = (e: any) => console.error("❌ MediaRecorder error:", e);

      // 2 second chunks → feels like live subtitles
      mediaRecorder.start(8000);
      setMode("tab");
      setConnected(true);

      // If user stops sharing from browser UI
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setConnected(false);
        setError("Screen sharing stopped.");
      });

    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        setError("Could not capture tab audio. Make sure to allow screen sharing.");
      }
    }
  };

  // ── Pause / Resume ─────────────────────────────────────────────────────────
  const togglePause = () => {
    if (paused) {
      if (mode === "mic") recognitionRef.current?.start();
      if (mode === "tab") mediaRecorderRef.current?.resume();
      setPaused(false);
    } else {
      if (mode === "mic") recognitionRef.current?.stop();
      if (mode === "tab") mediaRecorderRef.current?.pause();
      setPaused(true);
    }
  };

  // ── End session ────────────────────────────────────────────────────────────
  const endSession = async () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);

    const finalTranscript = transcriptRef.current;

    if (finalTranscript.trim()) {
      try {
        const results = await analyzeText(finalTranscript);
        sessionStorage.setItem("meetingResults", JSON.stringify(results));
      } catch {
        if (aiNotes) {
          sessionStorage.setItem("meetingResults", JSON.stringify({
            success: true,
            transcript: finalTranscript,
            wordCount: finalTranscript.split(" ").length,
            language: "en-US",
            summary: aiNotes.summary,
            actionItems: aiNotes.actionItems,
            keyDecisions: [],
            keyPoints: aiNotes.keyPoints,
            quiz: [],
            emailDraft: "",
          }));
        }
      }
    }
    navigate({ to: "/results" });
  };

  // ── Download transcript ────────────────────────────────────────────────────
  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meetmind-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss2 = String(seconds % 60).padStart(2, "0");
  const wordCount = transcript.split(" ").filter(Boolean).length;

  // ── IDLE / MODE SELECTION SCREEN ──────────────────────────────────────────
  if (mode === "idle") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-8">
            <div>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow mb-6">
                <Mic className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Start Live Session</h1>
              <p className="mt-3 text-muted-foreground">Choose how to capture audio</p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Mic */}
              <button
                onClick={startMic}
                className="gradient-border rounded-2xl p-6 text-left hover:shadow-glow transition-all hover:-translate-y-1 group"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Microphone</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  In-person meetings, lectures, your own voice
                </p>
                <div className="mt-3 text-xs text-green-500 font-medium">
                  ⚡ Instant subtitles
                </div>
              </button>

              {/* Tab capture */}
              <button
                onClick={startTabCapture}
                className="gradient-border rounded-2xl p-6 text-left hover:shadow-glow transition-all hover:-translate-y-1 group"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Browser Tab</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  YouTube, LinkedIn, Google Meet, Zoom — anyone speaking
                </p>
                <div className="mt-3 text-xs text-brand-purple font-medium">
                  🎬 Captions any video or call
                </div>
              </button>
            </div>

            {/* Tab mode instructions */}
            <div className="gradient-border rounded-xl p-4 text-left text-sm space-y-1">
              <p className="font-semibold text-brand-purple">📌 For Browser Tab mode:</p>
              <p className="text-muted-foreground">1. Click "Browser Tab" above</p>
              <p className="text-muted-foreground">2. Select the tab with your video/meeting</p>
              <p className="text-muted-foreground">3. ✅ Check <strong>"Share tab audio"</strong> at the bottom</p>
              <p className="text-muted-foreground">4. Click Share — subtitles appear in ~2s</p>
            </div>

            <p className="text-xs text-muted-foreground">
              🔒 Audio is processed securely and never stored permanently
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── LIVE SESSION SCREEN ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Recording bar */}
      <div className="sticky top-16 z-40 glass-strong border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/15 border border-destructive/30">
              <span className={`h-2.5 w-2.5 rounded-full bg-destructive ${!paused ? "animate-pulse" : ""}`} />
              <span className="font-semibold text-destructive text-sm">
                {paused ? "PAUSED" : "LIVE"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground font-mono tabular-nums">{mm}:{ss2}</span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              {connected
                ? <><Wifi className="h-3.5 w-3.5 text-green-500" /> Active</>
                : <><WifiOff className="h-3.5 w-3.5 text-destructive" /> Disconnected</>
              }
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              {mode === "mic"
                ? <><Mic className="h-3.5 w-3.5 text-brand-purple" /> Microphone</>
                : <><Monitor className="h-3.5 w-3.5 text-brand-purple" /> Tab Audio</>
              }
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs">
              <Languages className="h-3.5 w-3.5 text-brand-purple" />
              <span>EN</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs">
              <Sparkles className={`h-3.5 w-3.5 ${aiUpdating ? "text-yellow-500 animate-pulse" : "text-brand-purple"}`} />
              <span>{aiUpdating ? "AI updating..." : `AI in ${nextUpdateIn}s`}</span>
            </div>
            <Button variant="glass" size="sm" onClick={togglePause}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 pt-4">
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="flex-1 mx-auto max-w-[1400px] w-full px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 h-[calc(100vh-280px)] min-h-[520px]">

          {/* TRANSCRIPT / SUBTITLES */}
          <div className="gradient-border rounded-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-purple" />
                <h2 className="font-semibold">
                  {mode === "tab" ? "Live Captions" : "Live Transcript"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 items-end h-3">
                  {[0.4, 0.7, 1, 0.6, 0.8, 0.5].map((h, i) => (
                    <span
                      key={i}
                      className={`w-0.5 bg-brand-purple rounded-full ${!paused ? "animate-wave" : ""}`}
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{wordCount} words</span>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-2">
              {subtitleLines.length === 0 && !interimText && (
                <p className="text-muted-foreground text-sm">
                  {mode === "tab"
                    ? "Waiting for tab audio... make sure 'Share tab audio' was checked ✅"
                    : paused ? "Session paused..." : "Listening... start speaking!"
                  }
                </p>
              )}

              {/* Subtitle lines */}
              {subtitleLines.map((line) => (
                <div
                  key={line.id}
                  className={`px-4 py-2 rounded-xl text-[15px] leading-relaxed transition-all duration-500 ${
                    line.fresh
                      ? "bg-brand-purple/20 border border-brand-purple/40 text-foreground"
                      : "bg-accent/20 text-muted-foreground"
                  }`}
                >
                  {line.text}
                </div>
              ))}

              {/* Interim text (only for mic mode) */}
              {interimText && (
                <div className="px-4 py-2 rounded-xl text-[15px] leading-relaxed bg-accent/10 border border-dashed border-border/40 text-muted-foreground italic">
                  {interimText}
                  <span className="inline-block w-1.5 h-4 bg-brand-purple align-middle animate-pulse ml-1" />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Volume2 className="h-3.5 w-3.5 text-brand-purple" />
                {mode === "tab" ? "Tab audio · ~2s delay" : paused ? "Paused" : "Listening..."}
              </div>
              <button onClick={downloadTranscript} className="flex items-center gap-1 hover:text-foreground transition">
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
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${aiUpdating ? "bg-yellow-500 animate-pulse" : "bg-gradient-brand"}`}>
                    {aiUpdating ? "UPDATING..." : "LIVE"}
                  </span>
                </div>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="summary" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Summary</span>
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Actions</span>
                  </TabsTrigger>
                  <TabsTrigger value="key" className="gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Key</span>
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Quiz</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <TabsContent value="summary" className="mt-0 space-y-4 text-sm">
                  {aiNotes ? (
                    <div className="rounded-xl bg-gradient-brand-soft p-4 border border-border/40 animate-fade-in-up">
                      <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider mb-2">
                        Live Summary · {seconds - lastUpdateAt}s ago
                      </p>
                      <p className="leading-relaxed">{aiNotes.summary}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-accent/30 p-6 text-center text-muted-foreground text-sm">
                      <Sparkles className="h-6 w-6 mx-auto mb-2 text-brand-purple opacity-50" />
                      <p>AI summary appears after 1 minute</p>
                      <p className="text-xs mt-1 text-brand-purple">{nextUpdateIn}s remaining</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="mt-0 space-y-2">
                  {aiNotes?.actionItems?.length ? (
                    aiNotes.actionItems.map((a, i) => (
                      <label key={i} className="flex gap-3 items-start p-3 rounded-lg hover:bg-accent/40 cursor-pointer transition group">
                        <Square className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-brand-purple transition" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{a.task}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {a.owner && `@${a.owner} · `}due {a.due}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Action items appear after first AI update...
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="key" className="mt-0 space-y-2 text-sm">
                  {aiNotes?.keyPoints?.length ? (
                    aiNotes.keyPoints.map((k, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-accent/30 animate-fade-in-up">
                        <span className="text-brand-purple font-bold shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{k}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Key points appear after first AI update...
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quiz" className="mt-0">
                  <div className="p-6 text-center text-muted-foreground text-sm rounded-xl bg-accent/30">
                    <HelpCircle className="h-6 w-6 mx-auto mb-2 text-brand-purple opacity-50" />
                    Quiz generated when you end the session
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 glass-strong rounded-2xl p-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            {mode === "mic"
              ? <><Mic className="h-4 w-4 text-brand-purple" /> Microphone · Instant captions</>
              : <><Monitor className="h-4 w-4 text-brand-purple" /> Tab Audio · Live captions (~2s)</>
            }
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="glass" size="lg" onClick={togglePause}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="destructive" size="lg" className="shadow-glow" onClick={endSession}>
              <StopCircle className="h-5 w-5" /> End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
