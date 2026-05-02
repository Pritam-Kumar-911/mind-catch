# 🧠 MeetMind
### AI Lecture & Meeting Intelligence Platform

> Never miss a word again.

MeetMind captures, transcribes, and transforms live lectures and meetings into structured intelligence — summaries, action items, key decisions, quiz questions, and follow-up email drafts. Automatically.

**Live Demo:** [meetmind-frontend-992589154151.us-central1.run.app](https://meetmind-frontend-992589154151.us-central1.run.app)

---

## 🎯 The Problem

You are sitting in a lecture. The professor is explaining something important. You are still writing the previous point. You miss it.

After class the texts start — *"important questions konse the? teacher ne kya bola tha last mein?"*

Because you cannot listen and write at the same time. Nobody can.

The same problem exists in every meeting, every client call, every team discussion. People leave without clarity. Action items get forgotten. Decisions nobody remembers making.

MeetMind fixes this.

---

## ✨ Features

### Three Capture Modes
| Mode | Description |
|------|-------------|
| 🎙️ **Live Microphone** | For in-person classes and meetings. Speak naturally — MeetMind transcribes in real time including Roman Urdu |
| 🖥️ **Browser Tab Capture** | Share any tab playing a video, online class, or live meeting and get live captions from every speaker |
| 📁 **File Upload** | Upload any audio or video file — MP3, MP4, WAV, M4A — and get a complete brief in seconds |

### AI Output
Every session generates:
- **Executive Summary** — a distillation, not a transcript
- **Action Items** — with the person responsible and exact deadline
- **Key Decisions** — what was decided, not just discussed
- **Quiz Questions** — exam revision starts the moment class ends
- **Follow-up Email** — a complete professional draft ready to send

---

## 🏗️ Architecture

```
Audio Input (Mic / Tab / File)
         ↓
FFmpeg — converts any format to 16kHz WAV
         ↓
Google Cloud Speech-to-Text — transcription with speaker diarization
         ↓
Google Gemini 2.0 Flash — structured AI analysis
         ↓
Structured Output — summary, actions, decisions, quiz, email
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| shadcn/ui | Component library |
| TanStack Router | Client-side routing |
| Web Speech API | Real-time mic transcription |
| MediaRecorder API | Browser tab audio capture |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Multer | File upload handling |
| FFmpeg | Audio extraction and format conversion |

### AI & Cloud
| Service | Purpose |
|---------|---------|
| Google Gemini 2.0 Flash | Summaries, action items, quizzes, email drafts |
| Google Cloud Speech-to-Text | Audio transcription with speaker diarization |
| Google Cloud Run | Frontend and backend deployment |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/analyze` | Upload audio/video file → full AI analysis |
| POST | `/api/analyze-text` | Analyze plain text transcript |
| POST | `/api/live-update` | Live session AI notes update |
| POST | `/api/transcribe-chunk` | Real-time audio chunk transcription |

---

## 🚀 Getting Started

### Prerequisites
```
Node.js v22+
ffmpeg installed on system
Google Cloud account
Gemini API key
```

### 1. Clone the repo
```bash
git clone https://github.com/Pritam-Kumar-911/mind-catch.git
cd mind-catch
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd Backend
npm install
```

### 4. Set up environment variables

Create `Backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=./your-credentials.json
PORT=3001
```

Create `.env.local` in root:
```env
VITE_API_URL=http://localhost:3001
```

### 5. Run locally

Backend:
```bash
cd Backend
npm run dev
```

Frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:8080`
Backend runs on `http://localhost:3001`

---

## 📁 Project Structure

```
mind-catch/
├── src/
│   ├── routes/
│   │   ├── index.tsx        # Landing page
│   │   ├── live.tsx         # Live session page
│   │   ├── upload.tsx       # Upload page
│   │   └── results.tsx      # Results page
│   ├── components/          # Reusable UI components
│   ├── api.ts               # API service layer
│   └── styles.css           # Global styles
├── Backend/
│   ├── server.js            # Express API server
│   ├── Dockerfile           # Backend container
│   └── package.json
├── Dockerfile               # Frontend container
├── cloudrun-server.mjs      # Cloud Run Node server
└── nginx.conf               # Static file serving
```

---

## 🔮 Roadmap

- [ ] Improved Urdu speech recognition as models mature
- [ ] Meeting history and saved sessions
- [ ] Gmail API integration for one-click email sending
- [ ] Mobile app
- [ ] Multi-language support beyond Urdu and English
- [ ] Speaker identification by name

---

## 🇵🇰 Built For Pakistan

Every existing tool in this space was built for English, for Silicon Valley boardrooms, for markets that were never ours. MeetMind was built with Pakistani students and professionals in mind — where communication is bilingual by default and the tools available never reflected that reality.

---

## 👤 Author

**Pritam Kumar**
[GitHub](https://github.com/Pritam-Kumar-911) · [LinkedIn](https://www.linkedin.com/in/pritam-kumar-74b009253/)
