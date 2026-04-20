import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  UploadCloud, FileAudio, X, Sparkles, CheckCircle2, Clock, Shield,
  FileVideo, Music, Languages, Zap, Brain,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Recording — MeetMind" },
      { name: "description", content: "Upload your MP3, MP4, WAV or M4A recording for AI analysis." },
      { property: "og:title", content: "Upload Recording — MeetMind" },
      { property: "og:description", content: "Upload your recording for AI analysis." },
    ],
  }),
  component: UploadPage,
});

const FORMATS = [
  { ext: "MP3", icon: Music, color: "text-brand-blue" },
  { ext: "MP4", icon: FileVideo, color: "text-brand-purple" },
  { ext: "WAV", icon: Music, color: "text-brand-pink" },
  { ext: "M4A", icon: Music, color: "text-brand-purple" },
];

const PERKS = [
  { icon: Zap, t: "Lightning fast", d: "60-min file in ~90 seconds" },
  { icon: Shield, t: "Private & secure", d: "End-to-end encrypted" },
  { icon: Brain, t: "Smart AI", d: "Speaker detection built in" },
];

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("english");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) { p = 100; clearInterval(id); }
      setProgress(Math.round(p));
    }, 180);
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-brand-purple/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow mb-5">
            <UploadCloud className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Upload your recording</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            We'll transcribe, summarize, and extract action items in seconds.
          </p>
        </div>

        {/* Perks row */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {PERKS.map((p) => (
            <div key={p.t} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-brand-soft flex items-center justify-center shrink-0">
                <p.icon className="h-4 w-4 text-brand-purple" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{p.t}</p>
                <p className="text-xs text-muted-foreground">{p.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative gradient-border rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all overflow-hidden ${
            dragging ? "scale-[1.01] shadow-glow" : "hover:shadow-card"
          }`}
        >
          {dragging && <div className="absolute inset-0 bg-gradient-brand opacity-10" />}
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.mp4,.wav,.m4a,audio/*,video/mp4"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <div className="relative">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-brand-soft flex items-center justify-center mb-5 animate-float">
              <UploadCloud className="h-10 w-10 text-brand-purple" />
            </div>
            <p className="font-bold text-xl sm:text-2xl">Drag & drop your file here</p>
            <p className="mt-2 text-sm text-muted-foreground">or click to browse · max 500MB</p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {FORMATS.map((f) => (
                <div key={f.ext} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-semibold">
                  <f.icon className={`h-3.5 w-3.5 ${f.color}`} />
                  {f.ext}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File card */}
        {file && (
          <div className="mt-6 gradient-border rounded-2xl p-5 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-glow">
                <FileAudio className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{file.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~24 min</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); }} className="p-2 rounded-lg hover:bg-accent/50 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">
              <div className="h-2.5 w-full rounded-full bg-accent/50 overflow-hidden relative">
                <div className="h-full bg-gradient-brand transition-all duration-200 relative" style={{ width: `${progress}%` }}>
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              </div>
              <div className="mt-2.5 flex justify-between text-xs">
                <span className={`flex items-center gap-1.5 ${progress === 100 ? "text-green-500" : "text-muted-foreground"}`}>
                  {progress === 100 ? <><CheckCircle2 className="h-3.5 w-3.5" /> Upload complete</> : <>Uploading...</>}
                </span>
                <span className="font-mono font-semibold">{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Settings + CTA */}
        <div className="mt-6 gradient-border rounded-2xl p-5 sm:p-6">
          <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-end">
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Languages className="h-4 w-4 text-brand-purple" />
                Transcription language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">🇬🇧 English</SelectItem>
                  <SelectItem value="urdu">🇵🇰 Urdu (اردو)</SelectItem>
                  <SelectItem value="both">🌐 Both (English & Urdu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button asChild variant="brand" size="xl" disabled={!file || progress < 100} className="w-full sm:w-auto shadow-glow">
              <Link to="/results">
                <Sparkles className="h-5 w-5" />
                Analyze Meeting
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Files are processed securely and deleted after 30 days.
        </p>
      </div>
    </div>
  );
}
