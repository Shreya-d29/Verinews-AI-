import { demoPredict, hybridMerge, type Prediction } from "./nlp";

const ENDPOINT_KEY = "verinews:flask_endpoint";

export function getFlaskEndpoint(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ENDPOINT_KEY) || "";
}

export function setFlaskEndpoint(url: string) {
  if (typeof window === "undefined") return;
  if (url) localStorage.setItem(ENDPOINT_KEY, url);
  else localStorage.removeItem(ENDPOINT_KEY);
}

export async function analyzeArticle(input: {
  headline: string;
  body?: string;
  source?: string;
}): Promise<Prediction> {
  const text = [input.headline, input.body].filter(Boolean).join("\n\n");
  const endpoint = getFlaskEndpoint();

  if (!endpoint) {
    // Simulate slight latency for nicer UX
    await new Promise(r => setTimeout(r, 600));
    return demoPredict(text);
  }

  try {
    const res = await fetch(endpoint.replace(/\/$/, "") + "/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source: input.source }),
    });
    if (!res.ok) throw new Error(`Flask API ${res.status}`);
    const data = await res.json();
    return hybridMerge(
      {
        prediction: String(data.prediction || "Real"),
        confidence: Number(data.confidence ?? 0.5),
        explanation: data.explanation,
        verification: data.verification,
      },
      text,
    );
  } catch (err) {
    console.warn("Flask call failed, falling back to demo:", err);
    return demoPredict(text);
  }
}

// History (localStorage)
const HISTORY_KEY = "verinews:history";
export type HistoryItem = {
  id: string;
  headline: string;
  prediction: "Fake" | "Real";
  confidence: number;
  createdAt: number;
};

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(item: HistoryItem) {
  const list = [item, ...getHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
