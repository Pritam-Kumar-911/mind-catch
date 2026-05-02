import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import speech from "@google-cloud/speech";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load Google credentials from environment variable
// if (process.env.GOOGLE_CREDENTIALS_BASE64) {
//   const creds = Buffer.from(
//     process.env.GOOGLE_CREDENTIALS_BASE64,
//     "base64"
//   ).toString("utf8");
//   fs.writeFileSync("/tmp/credentials.json", creds);
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/credentials.json";
// }
// Use mounted secret file directly

// if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = "/secrets/credentials.json";
// }

// const speechClient = new speech.SpeechClient();



const execAsync = promisify(exec);
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Clients ──────────────────────────────────────────────────────────────────
const speechClient = new speech.SpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

const upload = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: { fileSize: 100 * 1024 * 1024 },
});

// ─── Helper: cleanup files ────────────────────────────────────────────────────
function cleanup(...files) {
  for (const f of files) {
    try {
      if (f && fs.existsSync(f)) fs.unlinkSync(f);
    } catch {}
  }
}

// ─── Helper: call Gemini with auto retry on 429 ───────────────────────────────
async function callGemini(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (err.message.includes("429") && i < retries - 1) {
        const wait = (i + 1) * 10000; // 10s, 20s, 30s
        console.log(`⏳ Rate limited. Retrying in ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

async function toUrduScript(text) {
  if (!text?.trim()) return text;
  const prompt = `
Convert the following transcript into proper Urdu script.
Rules:
- Return ONLY Urdu script text
- Do not add explanations
- Do not keep Roman Urdu
- Convert any Latin/English-script words phonetically into Urdu script where possible
- Keep meaning the same and keep punctuation natural
Text: """${text}"""`;

  const converted = await callGemini(prompt, 2);
  return converted.trim();
}

// ─── Gemini prompt helper ─────────────────────────────────────────────────────
function buildGeminiPrompt(transcript, full = true) {
  if (!full) {
    return `
You are a real-time meeting assistant. Based on this partial transcript, give a quick update.
PARTIAL TRANSCRIPT: """${transcript}"""
Return ONLY valid JSON (no markdown):
{
  "summary": "1-2 sentence summary so far",
  "actionItems": [{ "task": "task", "owner": "owner", "due": "due" }],
  "keyPoints": ["point 1", "point 2"]
}`;
  }

  return `
You are MeetMind, an AI meeting assistant. Analyze this transcript and return JSON.
TRANSCRIPT: """${transcript}"""
Return ONLY a valid JSON object (no markdown, no backticks):
{
  "summary": "3-4 sentence executive summary",
  "actionItems": [{ "task": "task description", "owner": "person name or Team", "due": "deadline or Soon" }],
  "keyDecisions": ["decision 1", "decision 2"],
  "keyPoints": ["key point 1", "key point 2"],
  "quiz": [{ "question": "question text", "answer": "answer text" }],
  "emailDraft": "Professional follow-up email draft"
}
Rules:
- Extract real action items with owners if mentioned
- Create 3-5 quiz questions
- Write a complete professional email
- Return ONLY the JSON`;
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "MeetMind backend is running 🚀" });
});

// ─── ROUTE 1: Upload any audio/video → Full AI analysis ──────────────────────
app.post("/api/analyze", upload.single("audio"), async (req, res) => {
  const filePath = req.file?.path;
  const wavPath = filePath ? filePath + ".wav" : null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const language = req.body.language || "en-US";
    console.log(`\n📁 File received: ${req.file.originalname}`);
    console.log(`📦 Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🌐 Language: ${language}`);

    // ── Step 1: Convert to WAV ────────────────────────────────────────────────
    console.log("🎬 Converting to WAV with ffmpeg...");
    try {
      await execAsync(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 -f wav "${wavPath}" -y`);
      console.log("✅ Conversion complete!");
    } catch (err) {
      console.error("❌ ffmpeg failed:", err.message);
      return res.status(422).json({
        error: "Could not process file. Make sure it's a valid audio or video file.",
      });
    }

    // ── Step 2: Check WAV size ────────────────────────────────────────────────
    const wavSize = fs.statSync(wavPath).size;
    console.log(`📊 WAV size: ${(wavSize / 1024 / 1024).toFixed(2)} MB`);

    if (wavSize > 10 * 1024 * 1024) {
      console.log("⚠️ File too large, trimming to 60s...");
      const trimmedPath = filePath + "_trimmed.wav";
      await execAsync(`ffmpeg -i "${wavPath}" -t 60 "${trimmedPath}" -y`);
      cleanup(wavPath);
      fs.renameSync(trimmedPath, wavPath);
      console.log("✅ Trimmed to 60 seconds");
    }

    // ── Step 3: Speech-to-Text ────────────────────────────────────────────────
    console.log("🎙️ Sending to Speech-to-Text...");
    const audioBytes = fs.readFileSync(wavPath).toString("base64");

    const [speechResponse] = await speechClient.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: language === "ur-PK" ? "ur-PK" : "en-US",
        alternativeLanguageCodes: language === "both" ? ["ur-PK", "en-US"] : [],
        enableAutomaticPunctuation: true,
        ...(language !== "ur-PK" && {
          enableSpeakerDiarization: true,
          diarizationSpeakerCount: 3,
          model: "latest_long",
        }),
      },
    });

    const transcript = speechResponse.results
      .map((r) => r.alternatives[0]?.transcript || "")
      .join(" ")
      .trim();

    if (!transcript) {
      return res.status(422).json({
        error: "No speech detected. Make sure the audio has clear speech and try again.",
      });
    }

    console.log(`✅ Transcript ready: "${transcript.substring(0, 80)}..."`);
    console.log(`📝 Word count: ${transcript.split(" ").length}`);

    // ── Step 4: Gemini ────────────────────────────────────────────────────────
    console.log("🧠 Sending to Gemini...");
    const geminiText = await callGemini(buildGeminiPrompt(transcript));

    let aiResults;
    try {
      const cleaned = geminiText.replace(/```json|```/g, "").trim();
      aiResults = JSON.parse(cleaned);
    } catch {
      console.error("❌ Gemini JSON parse failed:", geminiText.substring(0, 200));
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    console.log("✅ AI analysis complete!\n");

    res.json({
      success: true,
      transcript,
      wordCount: transcript.split(" ").length,
      language,
      ...aiResults,
    });

  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    cleanup(filePath, wavPath);
  }
});

// ─── ROUTE 2: Analyze plain text transcript ───────────────────────────────────
app.post("/api/analyze-text", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: "No transcript provided" });

  try {
    console.log("🧠 Analyzing text with Gemini...");
    const geminiText = await callGemini(buildGeminiPrompt(transcript));
    const cleaned = geminiText.replace(/```json|```/g, "").trim();
    const aiResults = JSON.parse(cleaned);
    console.log("✅ Text analysis complete!");
    res.json({ success: true, transcript, wordCount: transcript.split(" ").length, ...aiResults });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── ROUTE 3: Live session update ─────────────────────────────────────────────
app.post("/api/live-update", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: "No transcript provided" });

  try {
    const geminiText = await callGemini(buildGeminiPrompt(transcript, false));
    const cleaned = geminiText.replace(/```json|```/g, "").trim();
    const aiResults = JSON.parse(cleaned);
    res.json({ success: true, ...aiResults });
  } catch (error) {
    console.error("❌ Live update error:", error.message);
    // Always return valid JSON so frontend doesn't crash
    res.status(200).json({
      success: false,
      summary: "AI update temporarily unavailable. Will retry shortly.",
      actionItems: [],
      keyPoints: [],
    });
  }
});

// ─── ROUTE 4: Live audio chunk → transcript ───────────────────────────────────
app.post("/api/transcribe-chunk", upload.single("chunk"), async (req, res) => {
  const filePath = req.file?.path;
  const wavPath = filePath ? filePath + ".wav" : null;
  const startedAt = Date.now();

  try {
    if (!req.file) return res.status(400).json({ error: "No chunk" });
    console.log(`📥 Chunk received: ${req.file.size} bytes`);

    await execAsync(`ffmpeg -y -i "${filePath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${wavPath}"`);

    const wavSize = fs.existsSync(wavPath) ? fs.statSync(wavPath).size : 0;
    console.log(`🎚️ Converted WAV size: ${wavSize} bytes`);
    if (wavSize < 5000) {
      console.log("⚠️ WAV too small, returning empty transcript");
      return res.json({ success: true, transcript: "" });
    }

    const audioBytes = fs.readFileSync(wavPath).toString("base64");

    const requestedLanguage = req.body?.language || "en-US";
    console.log(`🌐 Chunk language requested: ${requestedLanguage}`);
    const languageConfig =
      requestedLanguage === "both"
        ? {
            languageCode: "ur-PK",
            alternativeLanguageCodes: ["en-US"],
          }
        : requestedLanguage === "ur-PK"
          ? { languageCode: "ur-PK" }
          : { languageCode: "en-US" };
    const modelConfig = requestedLanguage === "en-US" ? { model: "latest_long" } : {};

    const [speechResponse] = await speechClient.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        ...languageConfig,
        enableAutomaticPunctuation: true,
        ...modelConfig,
      },
    });

    const transcript = speechResponse.results
      .map((r) => r.alternatives[0]?.transcript || "")
      .join(" ")
      .trim();

    console.log(`📝 Raw transcript sample: "${transcript.slice(0, 80)}"`);
    let finalTranscript = transcript;
    if (requestedLanguage === "ur-PK" && transcript) {
      try {
        finalTranscript = await toUrduScript(transcript);
      } catch (err) {
        // Never fail live chunk transcription because transliteration hit quota/rate limits.
        // Raw STT output for ur-PK is already in Urdu script in most cases.
        console.warn("⚠️ Urdu script conversion skipped:", err.message);
        finalTranscript = transcript;
      }
    }
    if (requestedLanguage === "ur-PK") {
      console.log(`🔁 Urdu script sample: "${finalTranscript.slice(0, 80)}"`);
    }

    console.log(
      `🎬 Chunk transcript length: ${finalTranscript.length} chars · ${Date.now() - startedAt}ms`
    );
    res.json({ success: true, transcript: finalTranscript });

  } catch (error) {
    console.error(`❌ Chunk error after ${Date.now() - startedAt}ms:`, error.message);
    res.status(500).json({
      success: false,
      error: "Chunk transcription failed",
      details: error.message,
    });
  } finally {
    cleanup(filePath, wavPath);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 MeetMind backend running on http://localhost:${PORT}`);
  console.log(`📡 Routes:`);
  console.log(`   POST /api/analyze          → Upload audio/video file`);
  console.log(`   POST /api/analyze-text     → Analyze text transcript`);
  console.log(`   POST /api/live-update      → Live session AI updates`);
  console.log(`   POST /api/transcribe-chunk → Live chunk transcription\n`);
});
