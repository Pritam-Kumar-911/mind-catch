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
type TabLanguage = "en-US" | "ur-PK" | "both";

interface SubtitleLine {
  id: number;
  text: string;
  fresh: boolean;
}

function LiveSession() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<CaptureMode>("idle");
  const [tabLanguage, setTabLanguage] = useState<TabLanguage>("en-US");
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [subtitleLines, setSubtitleLines] = useState<SubtitleLine[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiNotes, setAiNotes] = useState<LiveUpdate | null>(null);
  const [aiUpdating, setAiUpdating] = useState(false);
  const [lastUpdateAt, setLastUpdateAt] = useState(0);
  const [nextUpdateIn, setNextUpdateIn] = useState(60);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleIdRef = useRef(0);
  const transcriptRef = useRef("");
  const pausedRef = useRef(false);
  const modeRef = useRef<CaptureMode>("idle");
  const tabLanguageRef = useRef<TabLanguage>("en-US");

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { tabLanguageRef.current = tabLanguage; }, [tabLanguage]);

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

  // ── Add subtitle line ──────────────────────────────────────────────────────
  const addSubtitleLine = useCallback((text: string) => {
    if (!text.trim()) return;
    const id = ++subtitleIdRef.current;
    setSubtitleLines((lines) => [...lines, { id, text: text.trim(), fresh: true }].slice(-50));
    setTranscript((t) => t + text + " ");
    setTimeout(() => {
      setSubtitleLines((lines) =>
        lines.map((l) => l.id === id ? { ...l, fresh: false } : l)
      );
    }, 2000);
  }, []);

  // ── MIC MODE ──────────────────────────────────────────────────────────────
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
        if (event.error === "no-speech" ||
          event.error === "audio-capture" ||
          event.error === "aborted") return;
        setError(`Mic error: ${event.error}`);
      };

      recognition.onend = () => {
        if (!pausedRef.current && modeRef.current === "mic") {
          setTimeout(() => {
            try { recognition.start(); } catch (e) {}
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

  // ── TAB MODE: recordAndSend loop (complete blobs = proper headers) ─────────
  const startTabCapture = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 16000,
        } as any,
      });

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setError("No audio detected. Make sure to check 'Share tab audio'.");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      // Keep ref in sync immediately; setState is async and can lag one tick.
      modeRef.current = "tab";
      setMode("tab");
      setConnected(true);

      // Stop if user closes share from browser
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setConnected(false);
        setMode("idle");
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      // ── recordAndSend loop ─────────────────────────────────────────────────
      // Records a COMPLETE 5s blob each time → proper headers → STT works ✅
      const recordAndSend = () => {
        if (modeRef.current !== "tab") return;

        const audioStream = new MediaStream(stream.getAudioTracks());
        const recorder = new MediaRecorder(audioStream, { mimeType });
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          // Complete blob with ALL headers intact
          const blob = new Blob(chunks, { type: mimeType });
          console.log(`📤 Sending complete blob: ${blob.size} bytes`);

          // Start next recording immediately so we don't lose words while
          // this chunk uploads/transcribes on the backend.
          if (modeRef.current === "tab") {
            recordAndSend();
          }

          if (blob.size > 5000 && !pausedRef.current) {
            const formData = new FormData();
            formData.append("chunk", blob, "audio.webm");
            formData.append("language", tabLanguageRef.current);

            try {
              // const res = await fetch("https://meetmind-backend-992589154151.us-central1.run.app/api/transcribe-chunk", {
              const res = await fetch("http://localhost:3001/api/transcribe-chunk", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              if (!res.ok || data.success === false) {
                const backendError = data?.error || "Transcription service unavailable.";
                setError(`Tab transcription error: ${backendError}`);
                console.error("❌ Chunk transcription failed:", data);
                return;
              }

              setError(null);
              console.log("✅ Transcript:", data.transcript);
              if (data.transcript) {
                addSubtitleLine(data.transcript);
              }
            } catch (e) {
              setError("Network error while sending tab audio chunk.");
              console.error("❌ Upload failed:", e);
            }
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;

        // Stop after 5s → triggers onstop → sends → restarts
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, 5000);
      };

      // Kick off the loop!
      recordAndSend();

    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        setError("Could not capture tab audio. Please allow screen sharing.");
      }
    }
  };

  // ── Pause / Resume ─────────────────────────────────────────────────────────
  const togglePause = () => {
    if (paused) {
      if (mode === "mic") recognitionRef.current?.start();
      setPaused(false);
    } else {
      if (mode === "mic") recognitionRef.current?.stop();
      if (mode === "tab") mediaRecorderRef.current?.stop();
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

  // ── IDLE SCREEN ───────────────────────────────────────────────────────────
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

              <button
                onClick={startTabCapture}
                className="gradient-border rounded-2xl p-6 text-left hover:shadow-glow transition-all hover:-translate-y-1 group"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Browser Tab</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  YouTube, LinkedIn, Google Meet — anyone speaking
                </p>
                <div className="mt-3 text-xs text-brand-purple font-medium">
                  🎬 Captions any video or call
                </div>
              </button>
            </div>

            <div className="gradient-border rounded-xl p-4 text-left text-sm space-y-1">
              <p className="font-semibold text-brand-purple">📌 For Browser Tab mode:</p>
              <p className="text-muted-foreground">1. Click "Browser Tab" above</p>
              <p className="text-muted-foreground">2. Select the tab with your video/meeting</p>
              <p className="text-muted-foreground">3. ✅ Check <strong>"Share tab audio"</strong> at the bottom</p>
              <p className="text-muted-foreground">4. Click Share — captions appear every ~5s</p>
            </div>

            <p className="text-xs text-muted-foreground">
              🔒 Audio is processed securely and never stored permanently
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── LIVE SESSION SCREEN ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

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
            {mode === "tab" ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg glass text-xs">
                <Languages className="h-3.5 w-3.5 text-brand-purple" />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTabLanguage("en-US")}
                    className={`px-2 py-1 rounded-md transition ${
                      tabLanguage === "en-US"
                        ? "bg-brand-purple text-white"
                        : "hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabLanguage("ur-PK")}
                    className={`px-2 py-1 rounded-md transition ${
                      tabLanguage === "ur-PK"
                        ? "bg-brand-purple text-white"
                        : "hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    Urdu (Beta)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabLanguage("both")}
                    className={`px-2 py-1 rounded-md transition ${
                      tabLanguage === "both"
                        ? "bg-brand-purple text-white"
                        : "hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    Mixed
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs">
                <Languages className="h-3.5 w-3.5 text-brand-purple" />
                <span>English</span>
              </div>
            )}
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

      {(mode === "tab" && (tabLanguage === "ur-PK" || tabLanguage === "both")) && (
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 pt-4">
          <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
            Urdu transcription is in beta for this prototype and may be less accurate than English.
          </div>
        </div>
      )}

      <div className="flex-1 mx-auto max-w-[1400px] w-full px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 h-[calc(100vh-280px)] min-h-[520px]">

          {/* TRANSCRIPT */}
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

              {subtitleLines.map((line) => (
                <div
                  key={line.id}
                  className={`px-4 py-2 rounded-xl text-[15px] leading-relaxed transition-all duration-500 ${line.fresh
                    ? "bg-brand-purple/20 border border-brand-purple/40 text-foreground"
                    : "bg-accent/20 text-muted-foreground"
                    }`}
                >
                  {line.text}
                </div>
              ))}

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
                {mode === "tab" ? "Tab audio · ~5s delay" : paused ? "Paused" : "Listening..."}
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
              : <><Monitor className="h-4 w-4 text-brand-purple" /> Tab Audio · Captions every ~5s</>
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
