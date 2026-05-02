// const BASE_URL = "https://meetmind-backend-992589154151.us-central1.run.app";
const BASE_URL = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ActionItem {
  task: string;
  owner: string;
  due: string;
}

export interface QuizItem {
  question: string;
  answer: string;
}

export interface MeetingResults {
  success: boolean;
  transcript: string;
  wordCount: number;
  language: string;
  summary: string;
  actionItems: ActionItem[];
  keyDecisions: string[];
  keyPoints: string[];
  quiz: QuizItem[];
  emailDraft: string;
}

export interface LiveUpdate {
  success: boolean;
  summary: string;
  actionItems: ActionItem[];
  keyPoints: string[];
}

// ─── API 1: Upload audio file → Full analysis ────────────────────────────────
export async function analyzeAudio(
  file: File,
  language: string = "en-US"
): Promise<MeetingResults> {
  const formData = new FormData();
  formData.append("audio", file);
  formData.append("language", language);

  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze audio");
  }

  return response.json();
}

// ─── API 2: Analyze plain text transcript ────────────────────────────────────
export async function analyzeText(
  transcript: string
): Promise<MeetingResults> {
  const response = await fetch(`${BASE_URL}/api/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze transcript");
  }

  return response.json();
}

// ─── API 3: Live session update ──────────────────────────────────────────────
export async function getLiveUpdate(
  transcript: string
): Promise<LiveUpdate> {
  const response = await fetch(`${BASE_URL}/api/live-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get live update");
  }

  return response.json();
}

// ─── Language mapper ──────────────────────────────────────────────────────────
export function mapLanguage(selected: string): string {
  const map: Record<string, string> = {
    english: "en-US",
    urdu: "ur-PK",
    both: "both",
  };
  return map[selected] || "en-US";
}
