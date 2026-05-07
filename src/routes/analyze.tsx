import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Search, Trash2, Globe2, Sparkles, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResultCard } from "@/components/ResultCard";
import { analyzeArticle, getFlaskEndpoint, saveHistory } from "@/lib/api";
import type { Prediction } from "@/lib/nlp";
import { toast } from "sonner";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze article — VeriNews AI" },
      { name: "description", content: "Paste a headline and article body to detect whether the news is fake or real." },
      { property: "og:title", content: "Analyze article — VeriNews AI" },
      { property: "og:description", content: "Hybrid ML + NLP fake news verdict in seconds." },
    ],
  }),
  component: AnalyzePage,
});

const SAMPLES = [
  {
    label: "Suspicious headline",
    headline: "SHOCKING: Doctors HATE this one secret that EXPOSED the entire industry!!!",
    body: "You won't believe what scientists discovered. This bombshell revelation is being banned by mainstream media. Click here before they take it down forever!",
  },
  {
    label: "Neutral report",
    headline: "Federal Reserve holds interest rates steady at March meeting",
    body: "The Federal Reserve announced on Wednesday that it would maintain the federal funds rate within its current target range, citing stable employment data and moderating inflation. Officials indicated they would continue monitoring incoming economic data before adjusting policy.",
  },
];

function AnalyzePage() {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);

  const submit = async () => {
    if (!headline.trim()) {
      toast.error("Please enter a headline");
      return;
    }
    setLoading(true);
    try {
      const res = await analyzeArticle({ headline, body, source });
      setResult(res);
      saveHistory({
        id: crypto.randomUUID(),
        headline: headline.slice(0, 140),
        prediction: res.prediction,
        confidence: res.confidence,
        createdAt: Date.now(),
      });
    } catch (e) {
      toast.error("Analysis failed. Check your Flask endpoint in Settings.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setHeadline("");
    setBody("");
    setSource("");
    setResult(null);
  };

  const endpoint = typeof window !== "undefined" ? getFlaskEndpoint() : "";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      <div className="mb-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Article analyzer</h1>
        <p className="mt-3 text-lg text-muted-foreground/80">
          Paste any news article. We'll classify it as Fake or Real with a confidence score and a transparent breakdown.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <div className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline <span className="text-destructive">*</span></Label>
              <Input
                id="headline"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. Scientists discover new species in Amazon rainforest"
                className="mt-1.5"
                maxLength={300}
              />
            </div>
            <div>
              <Label htmlFor="body">Article body <span className="text-muted-foreground font-normal">(optional but recommended)</span></Label>
              <Textarea
                id="body"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Paste the full article here for the most accurate analysis..."
                className="mt-1.5 min-h-[180px] resize-y"
                maxLength={10000}
              />
              <div className="mt-1 text-right text-xs text-muted-foreground tabular-nums">{body.length}/10000</div>
            </div>
            <div>
              <Label htmlFor="source">Source <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="source"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="e.g. reuters.com"
                className="mt-1.5"
                maxLength={200}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button onClick={submit} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "Analyzing…" : "Analyze"}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={loading} className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
              <div className="ml-auto flex flex-wrap gap-2">
                {SAMPLES.map(s => (
                  <Button
                    key={s.label}
                    variant="outline"
                    size="sm"
                    onClick={() => { setHeadline(s.headline); setBody(s.body); setSource(""); }}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          {result ? (
            <ResultCard result={result} />
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">Awaiting input</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Submit an article on the left to see the verdict, confidence score and linguistic breakdown here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
