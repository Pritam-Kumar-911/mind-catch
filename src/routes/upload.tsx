import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileAudio, X, Sparkles } from "lucide-react";
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
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow mb-4">
            <UploadCloud className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Upload your recording</h1>
          <p className="mt-3 text-muted-foreground">We'll transcribe, summarize, and extract action items in seconds.</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`glass rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragging ? "border-brand-purple bg-gradient-brand-soft scale-[1.01]" : "border-border hover:border-brand-purple/60"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.mp4,.wav,.m4a,audio/*,video/mp4"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <UploadCloud className="mx-auto h-12 w-12 text-brand-purple animate-float" />
          <p className="mt-4 font-semibold text-lg">Drag & drop your file here</p>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["MP3", "MP4", "WAV", "M4A"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-accent/50 text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>

        {file && (
          <div className="mt-6 glass rounded-xl p-5 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                <FileAudio className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setFile(null); setProgress(0); }} className="p-2 rounded-lg hover:bg-accent/50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-accent/50 overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{progress < 100 ? "Uploading..." : "Ready to analyze"}</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-2 block">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="urdu">Urdu</SelectItem>
                <SelectItem value="both">Both (English & Urdu)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild variant="brand" size="xl" disabled={!file || progress < 100} className="w-full sm:w-auto">
            <Link to="/results">
              <Sparkles className="h-5 w-5" />
              Analyze Meeting
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
