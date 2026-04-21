import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import speech from "@google-cloud/speech";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Clients ────────────────────────────────────────────────────────────────
const speechClient = new speech.SpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Store uploads in /backend/uploads
const upload = multer({ dest: path.join(__dirname, "uploads/") });

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "MeetMind backend is running 🚀" });
});

// ─── ROUTE 1: Upload audio → Transcript + AI Results ────────────────────────
app.post("/api/analyze", upload.single("audio"), async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const language = req.body.language || "en-US";

    console.log(`📁 File received: ${req.file.originalname}`);
    console.log(`🌐 Language: ${language}`);

    // ── Step 1: Read audio file ──────────────────────────────────────────────
    const audioBytes = fs.readFileSync(filePath).toString("base64");

    // ── Step 2: Send to Google Speech-to-Text ───────────────────────────────
    console.log("🎙️ Sending to Speech-to-Text...");

    const speechRequest = {
      audio: { content: audioBytes },
      config: {
        encoding: "MP3",
        sampleRateHertz: 16000,
        languageCode: language === "ur-PK" ? "ur-PK" : "en-US",
        alternativeLanguageCodes: language === "both" ? ["ur-PK", "en-US"] : [],
        enableAutomaticPunctuation: true,
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 3,
        model: "latest_long",
      },
    };

    const [speechResponse] = await speechClient.recognize(speechRequest);

    const transcript = speechResponse.results
      .map((r) => r.alternatives[0]?.transcript || "")
      .join(" ")
      .trim();

    if (!transcript) {
      return res.status(422).json({
        error: "Could not transcribe audio. Please check the file format.",
      });
    }

    console.log(`✅ Transcript ready (${transcript.split(" ").length} words)`);

    // ── Step 3: Send transcript to Gemini ───────────────────────────────────
    console.log("🧠 Sending to Gemini for analysis...");

    const geminiPrompt = `
You are MeetMind, an AI meeting assistant. Analyze this meeting transcript and return a JSON response.

TRANSCRIPT:
"""
${transcript}
"""

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
{
  "summary": "3-4 sentence executive summary of the meeting",
  "actionItems": [
    { "task": "task description", "owner": "person name or Team", "due": "deadline or Soon" }
  ],
  "keyDecisions": [
    "decision 1",
    "decision 2"
  ],
  "keyPoints": [
    "key point 1",
    "key point 2"
  ],
  "quiz": [
    { "question": "question text", "answer": "answer text" }
  ],
  "emailDraft": "Professional follow-up email draft based on the meeting"
}

Rules:
- actionItems: extract real tasks with owners if mentioned
- quiz: create 3-5 questions based on key content
- emailDraft: write a complete professional email
- If something is not clear, make a reasonable inference
- Return ONLY the JSON, nothing else
`;

    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const geminiText = geminiResult.response.text();

    // ── Step 4: Parse Gemini response ───────────────────────────────────────
    let aiResults;
    try {
      const cleaned = geminiText.replace(/```json|```/g, "").trim();
      aiResults = JSON.parse(cleaned);
    } catch {
      console.error("❌ Failed to parse Gemini JSON:", geminiText);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    console.log("✅ AI analysis complete!");

    // ── Step 5: Return everything ────────────────────────────────────────────
    res.json({
      success: true,
      transcript,
      wordCount: transcript.split(" ").length,
      language,
      ...aiResults,
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// ─── ROUTE 2: Analyze plain text transcript ──────────────────────────────────
app.post("/api/analyze-text", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "No transcript provided" });
  }

  try {
    console.log("🧠 Analyzing text transcript with Gemini...");

    const geminiPrompt = `
You are MeetMind, an AI meeting assistant. Analyze this meeting transcript and return a JSON response.

TRANSCRIPT:
"""
${transcript}
"""

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
{
  "summary": "3-4 sentence executive summary of the meeting",
  "actionItems": [
    { "task": "task description", "owner": "person name or Team", "due": "deadline or Soon" }
  ],
  "keyDecisions": [
    "decision 1",
    "decision 2"
  ],
  "keyPoints": [
    "key point 1",
    "key point 2"
  ],
  "quiz": [
    { "question": "question text", "answer": "answer text" }
  ],
  "emailDraft": "Professional follow-up email draft based on the meeting"
}

Rules:
- actionItems: extract real tasks with owners if mentioned
- quiz: create 3-5 questions based on key content  
- emailDraft: write a complete professional email
- Return ONLY the JSON, nothing else
`;

    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const geminiText = geminiResult.response.text();

    let aiResults;
    try {
      const cleaned = geminiText.replace(/```json|```/g, "").trim();
      aiResults = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    console.log("✅ Text analysis complete!");

    res.json({
      success: true,
      transcript,
      wordCount: transcript.split(" ").length,
      ...aiResults,
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── ROUTE 3: Live transcript chunk → Quick AI update ───────────────────────
app.post("/api/live-update", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "No transcript provided" });
  }

  try {
    const geminiPrompt = `
You are a real-time meeting assistant. Based on this partial transcript, give a quick update.

PARTIAL TRANSCRIPT:
"""
${transcript}
"""

Return ONLY a valid JSON object (no markdown):
{
  "summary": "1-2 sentence summary so far",
  "actionItems": [
    { "task": "task", "owner": "owner", "due": "due" }
  ],
  "keyPoints": ["point 1", "point 2"]
}
`;

    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const geminiText = geminiResult.response.text();

    const cleaned = geminiText.replace(/```json|```/g, "").trim();
    const aiResults = JSON.parse(cleaned);

    res.json({ success: true, ...aiResults });

  } catch (error) {
    console.error("❌ Live update error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 MeetMind backend running on http://localhost:${PORT}`);
  console.log(`📡 Routes ready:`);
  console.log(`   POST /api/analyze       → Upload audio file`);
  console.log(`   POST /api/analyze-text  → Analyze text transcript`);
  console.log(`   POST /api/live-update   → Live session AI updates\n`);
});
