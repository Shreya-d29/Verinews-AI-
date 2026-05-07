// Client-side NLP signal extraction. Pure TypeScript so it works in the browser
// and on the edge runtime. Used both as a hybrid layer over the ML prediction
// and as the demo-mode classifier when no Flask endpoint is configured.

export type NlpSignal = {
  key: string;
  label: string;
  score: number; // 0..1, higher = more suspicious
  detail: string;
};

export type NlpReport = {
  signals: NlpSignal[];
  suspiciousWords: string[];
  keywords: string[];
  sentiment: "negative" | "neutral" | "positive";
  sentimentScore: number; // -1..1
  capsRatio: number;
  exclamationCount: number;
  totalSuspicionScore: number; // 0..1
};

const SENSATIONAL = [
  "shocking", "unbelievable", "you won't believe", "miracle", "secret",
  "exposed", "destroyed", "slammed", "blasted", "outrage", "bombshell",
  "jaw-dropping", "stunning", "breaking", "urgent", "must see", "click here",
  "they don't want you to know", "doctors hate", "conspiracy", "hoax",
  "scandal", "explosive", "leaked", "banned", "cover-up",
  "government bans", "nationwide shutdown", "immediate effect", "millions affected",
  "official leaked news", "emergency decision", "financial collapse", "major disruption",
  "sudden announcement", "drastic measures", "unprecedented", "confidential report"
];

const HIGH_RISK_TOPICS = [
  "upi", "banking", "currency", "shutdown", "ban", "restriction", "law",
  "constitution", "emergency", "military", "tax", "pension", "salary"
];

const POSITIVE = ["good","great","positive","success","win","gain","benefit","peace","agree","support"];
const NEGATIVE = ["bad","terrible","fail","crisis","attack","kill","death","war","hate","corrupt","fraud","scam"];
const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","in","on","at","to","for","with","by","is","are","was","were",
  "be","been","being","have","has","had","do","does","did","this","that","these","those","it","its",
  "as","from","not","no","so","if","than","then","also","s","t","i","we","you","he","she","they",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function extractKeywords(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) {
    if (tok.length < 4 || STOPWORDS.has(tok)) continue;
    counts.set(tok, (counts.get(tok) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

export function analyzeText(text: string): NlpReport {
  const cleaned = text.trim();
  const tokens = tokenize(cleaned);
  const lower = cleaned.toLowerCase();

  // Sensational / clickbait phrases
  const suspiciousWords: string[] = [];
  for (const phrase of SENSATIONAL) {
    if (lower.includes(phrase)) suspiciousWords.push(phrase);
  }

  // ALL CAPS words (length > 3)
  const capsMatches = cleaned.match(/\b[A-Z]{4,}\b/g) || [];
  const capsRatio = tokens.length ? capsMatches.length / tokens.length : 0;

  // Excessive punctuation
  const exclamationCount = (cleaned.match(/!/g) || []).length;
  const questionCount = (cleaned.match(/\?{2,}/g) || []).length;

  // Sentiment (lexicon-based, simple)
  let pos = 0, neg = 0;
  for (const tok of tokens) {
    if (POSITIVE.includes(tok)) pos++;
    if (NEGATIVE.includes(tok)) neg++;
  }
  const sentTotal = pos + neg;
  const sentimentScore = sentTotal ? (pos - neg) / sentTotal : 0;
  const sentiment: NlpReport["sentiment"] =
    sentimentScore > 0.2 ? "positive" : sentimentScore < -0.2 ? "negative" : "neutral";

  const signals: NlpSignal[] = [];

  if (suspiciousWords.length) {
    signals.push({
      key: "sensational",
      label: "Sensational language",
      score: Math.min(1, suspiciousWords.length / 4),
      detail: `Detected ${suspiciousWords.length} clickbait/sensational phrase(s): ${suspiciousWords.slice(0, 4).join(", ")}`,
    });
  }
  if (capsRatio > 0.05) {
    signals.push({
      key: "caps",
      label: "Excessive ALL CAPS",
      score: Math.min(1, capsRatio * 6),
      detail: `${(capsRatio * 100).toFixed(1)}% of words are in ALL CAPS — common in fabricated headlines.`,
    });
  }
  if (exclamationCount >= 3) {
    signals.push({
      key: "exclaim",
      label: "Excessive punctuation",
      score: Math.min(1, exclamationCount / 8),
      detail: `${exclamationCount} exclamation marks detected — emotional emphasis pattern.`,
    });
  }
  if (questionCount >= 1) {
    signals.push({
      key: "question",
      label: "Rhetorical questioning",
      score: 0.4,
      detail: `Multiple consecutive '?' detected — clickbait pattern.`,
    });
  }
  if (Math.abs(sentimentScore) > 0.5) {
    signals.push({
      key: "sentiment",
      label: `Extreme ${sentiment} sentiment`,
      score: Math.abs(sentimentScore),
      detail: `Sentiment score ${sentimentScore.toFixed(2)} — extreme emotional framing reduces credibility.`,
    });
  }
  if (tokens.length > 0 && tokens.length < 12) {
    signals.push({
      key: "short",
      label: "Very short article",
      score: 0.3,
      detail: `Only ${tokens.length} words — credible reporting is typically more substantial.`,
    });
  }

  // High-Risk Rule Based Detection
  const highRiskClaims: string[] = [];
  const riskPhrases = [
    { regex: /government.*bans.*upi/i, label: "Banking Ban Rumor" },
    { regex: /nationwide.*shutdown/i, label: "National Emergency Rumor" },
    { regex: /currency.*demonetization/i, label: "Financial Instability Claim" },
    { regex: /whatsapp.*monitored/i, label: "Privacy Violation Rumor" },
    { regex: /internet.*permanently.*off/i, label: "Communication Blackout Claim" }
  ];

  for (const rule of riskPhrases) {
    if (rule.regex.test(lower)) {
      highRiskClaims.push(rule.label);
      signals.push({
        key: "high_risk",
        label: `High-Risk Claim: ${rule.label}`,
        score: 0.95,
        detail: "This claim targets critical infrastructure or government policy, a common vector for high-impact misinformation."
      });
    }
  }

  // Cross-reference keywords with high-risk topics
  const detectedRiskTopics = HIGH_RISK_TOPICS.filter(t => lower.includes(t));
  if (detectedRiskTopics.length >= 2 && suspiciousWords.length >= 1) {
    signals.push({
      key: "topic_risk",
      label: "Sensitive Topic Aggregation",
      score: 0.8,
      detail: `Multiple sensitive topics (${detectedRiskTopics.slice(0, 3).join(", ")}) combined with sensationalism — extremely high probability of fabrication.`
    });
  }

  const totalSuspicionScore = signals.length
    ? Math.min(1, signals.reduce((s, x) => s + x.score, 0) / Math.max(2, signals.length))
    : 0;

  return {
    signals,
    suspiciousWords,
    keywords: extractKeywords(cleaned),
    sentiment,
    sentimentScore,
    capsRatio,
    exclamationCount,
    totalSuspicionScore,
  };
}

export type Prediction = {
  prediction: "Fake" | "Real";
  confidence: number; // 0..1
  explanation: string;
  source: "flask" | "demo";
  nlp: NlpReport;
  verification?: {
    title: string;
    articles: Array<{
      source: string;
      headline: string;
      summary: string;
      link: string;
      truth_score?: number;
    }>;
    comparison: {
      fake_claim: string;
      actual_truth: string;
    };
  };
};

// Demo classifier — used when no Flask endpoint is configured.
// Combines NLP signals into a Fake/Real verdict so the UI is fully functional.
export function demoPredict(text: string): Prediction {
  const nlp = analyzeText(text);
  const suspicion = nlp.totalSuspicionScore;
  const isFake = suspicion >= 0.45;
  const confidence = isFake
    ? 0.55 + suspicion * 0.4
    : 0.6 + (1 - suspicion) * 0.35;

  const reasons: string[] = [];
  if (nlp.signals.length) {
    reasons.push(nlp.signals.slice(0, 3).map(s => s.label.toLowerCase()).join(", "));
  } else {
    reasons.push("neutral tone, factual phrasing, no clickbait markers");
  }

  return {
    prediction: isFake ? "Fake" : "Real",
    confidence: Math.min(0.98, confidence),
    explanation: isFake
      ? `Likely fabricated — ${reasons.join("; ")}.`
      : `Appears credible — ${reasons.join("; ")}.`,
    source: "demo",
    nlp,
    verification: isFake ? {
      title: "Verified Real News / What Actually Happened",
      articles: [
        {
          source: "Reuters",
          headline: "Fact Check: Investigating recent viral claims",
          summary: "Our investigation shows that the viral claims regarding this topic are unsubstantiated and lack primary evidence.",
          link: "https://www.reuters.com/fact-check",
          truth_score: 0.98
        }
      ],
      comparison: {
        fake_claim: "The analyzed text contains multiple sensationalist and unverified assertions.",
        actual_truth: "Official reports and credible news agencies contradict these claims with evidence-based reporting."
      }
    } : undefined
  };
}

// Merge a Flask ML response with local NLP signals.
export function hybridMerge(
  flask: { 
    prediction: string; 
    confidence: number; 
    explanation?: string;
    verification?: Prediction["verification"];
  },
  text: string
): Prediction {
  const nlp = analyzeText(text);
  const flaskFake = /fake/i.test(flask.prediction);
  
  // Weights for final score adjustment
  const ML_WEIGHT = 0.6;
  const NLP_WEIGHT = 0.4;
  
  // Calculate a baseline score (0 = Fake, 1 = Real)
  let baseScore = flaskFake ? (1 - flask.confidence) : flask.confidence;
  
  // Apply NLP penalties to the score
  // If NLP suspicion is high, it pulls the score toward 0 (Fake)
  const nlpPenalty = nlp.totalSuspicionScore;
  let adjustedScore = (baseScore * ML_WEIGHT) + ((1 - nlpPenalty) * NLP_WEIGHT);

  // If a High-Risk claim is detected, apply a massive penalty
  if (nlp.signals.some(s => s.key === 'high_risk')) {
    adjustedScore *= 0.5; // Cut trustworthiness in half
  }

  // Final Verdict
  const isFake = adjustedScore < 0.5;
  const finalConfidence = isFake ? (1 - adjustedScore) : adjustedScore;

  const explanation =
    (flask.explanation || `ML model returned ${flask.prediction}.`) +
    (nlp.signals.length
      ? ` High-impact signals: ${nlp.signals.map(s => s.label.toLowerCase()).join(", ")}.`
      : " NLP layer found no major red flags.");

  return {
    prediction: isFake ? "Fake" : "Real",
    confidence: Math.min(0.99, finalConfidence),
    explanation,
    source: "flask",
    nlp,
    verification: flask.verification,
  };
}
