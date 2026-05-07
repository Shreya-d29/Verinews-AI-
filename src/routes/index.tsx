import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Sparkles, ShieldCheck, Zap, BarChart3, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VeriNews AI — Hybrid ML + NLP fake news detector" },
      { name: "description", content: "Paste a headline or article and instantly get a Fake/Real verdict with confidence score, linguistic signals and explainable reasoning." },
      { property: "og:title", content: "VeriNews AI — Hybrid ML + NLP fake news detector" },
      { property: "og:description", content: "Explainable fake news detection powered by machine learning and NLP." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            AI-Powered News Verification
          </div>
          <h1 className="font-display text-6xl font-bold leading-[1.1] tracking-tight sm:text-7xl">
            Experience next-generation <span className="text-gradient">news intelligence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground/80">
            Comprehensive, hybrid system to detect fake news including misinformation, 
            clickbait, deepfake articles, and sensationalist propaganda.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-base font-semibold transition-transform hover:scale-105 active:scale-95">
              <Link to="/analyze" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8 text-base font-semibold">
              <Link to="/settings" className="flex items-center gap-2">
                <Globe2 className="h-4 w-4" /> View Documentation
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Brain, title: "ML classifier", body: "Plug in your TF-IDF + Logistic Regression or BERT model via a Flask endpoint." },
            { icon: ShieldCheck, title: "NLP hybrid layer", body: "Sentiment, clickbait, ALL CAPS, punctuation and entity signals refine every verdict." },
            { icon: Sparkles, title: "Explainable", body: "Every prediction comes with highlighted suspicious phrases and a written rationale." },
            { icon: Zap, title: "Instant feedback", body: "Sub-second analysis. Demo mode works fully offline with no model required." },
            { icon: BarChart3, title: "History & charts", body: "Track every analysis locally with confidence trends and verdict breakdowns." },
            { icon: Globe2, title: "Bring your own model", body: "Point VeriNews at any compatible Flask service — your model, your infrastructure." },
          ].map(f => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-5 shadow-elegant transition-all hover:border-primary/30 hover:shadow-glow">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">How the hybrid pipeline works</h2>
              <p className="mt-3 text-muted-foreground">
                Each article flows through two independent layers. The ML model gives a probabilistic
                Fake/Real prediction. The NLP layer extracts linguistic red flags. We merge them
                into a single calibrated verdict with a transparent explanation.
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "Headline + body sent to your Flask /predict endpoint",
                  "Local NLP extracts sentiment, keywords, sensational phrases",
                  "Hybrid scoring adjusts confidence and produces reasoning",
                  "Result rendered with highlights and signal breakdown",
                ].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="font-mono text-xs text-muted-foreground">POST /predict</div>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed">
{`{
  "text": "Scientists confirm new
           climate study findings...",
  "source": "reuters.com"
}`}
              </pre>
              <div className="mt-4 font-mono text-xs text-muted-foreground">200 OK</div>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed">
{`{
  "prediction": "Real",
  "confidence": 0.92,
  "explanation": "Neutral tone,
                   factual phrasing"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
