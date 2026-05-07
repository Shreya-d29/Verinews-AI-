import { CheckCircle2, AlertTriangle, Sparkles, Hash, Activity, ArrowRight } from "lucide-react";
import type { Prediction } from "@/lib/nlp";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ResultCard({ result }: { result: Prediction }) {
  const fake = result.prediction === "Fake";
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">Analysis Results</h2>
      
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
        <div className="p-6">
          {/* Risk Level Indicator */}
          <div className={`mb-8 flex items-center gap-3 rounded-xl border p-4 ${
            fake 
              ? pct > 70 
                ? "border-destructive/20 bg-destructive/5 text-destructive" 
                : "border-warning/20 bg-warning/5 text-warning"
              : "border-success/20 bg-success/5 text-success"
          }`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
              {fake ? (
                pct > 70 ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wide">
                Risk Level: {fake ? (pct > 70 ? "High" : "Medium") : "Low"}
              </div>
              <p className="text-xs opacity-80">
                {fake 
                  ? "Significant suspicious signals detected in content." 
                  : "Content aligns with typical factual reporting patterns."}
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Confidence</div>
              <div className="font-mono text-xl font-bold">{pct}%</div>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Findings ({result.nlp.signals.length})</span>
              </div>
              <ul className="space-y-3">
                {result.nlp.signals.map(s => {
                  const isCritical = s.score > 0.6;
                  return (
                    <li key={s.key} className="group relative rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:bg-secondary/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className={`text-sm font-bold ${isCritical ? "text-destructive" : "text-foreground"}`}>
                            {s.label.toLowerCase()}
                          </span>
                          <p className="text-xs leading-relaxed text-muted-foreground/90">
                            {s.detail}
                          </p>
                        </div>
                        <Badge variant={isCritical ? "destructive" : "secondary"} className="shrink-0 text-[10px] font-bold uppercase tracking-tighter">
                          {isCritical ? "Critical" : "Low"}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reasoning & Context
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 italic">
                "{result.explanation}"
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-6">
              {result.nlp.suspiciousWords.length > 0 && (
                <section>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Suspicious phrases
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.nlp.suspiciousWords.map(w => (
                      <Badge key={w} variant="outline" className="border-destructive/20 bg-destructive/5 text-[10px] font-normal text-destructive">{w}</Badge>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Linguistic Stats
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sentiment:</span>
                    <span className="font-mono font-bold">{result.nlp.sentiment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Caps Ratio:</span>
                    <span className="font-mono font-bold">{(result.nlp.capsRatio * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Real News Section (Conditional) */}
      {result.verification && (
        <div className="overflow-hidden rounded-2xl border border-success/30 bg-card shadow-elegant animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-success/5 border-b border-success/10 p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-success">
              <Sparkles className="h-5 w-5" />
              {result.verification.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We've scanned trusted sources to bring you the factual baseline.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Comparison Layer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-destructive">The Fake Claim</div>
                <p className="text-sm font-medium leading-relaxed">{result.verification.comparison.fake_claim}</p>
              </div>
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-success">The Actual Truth</div>
                <p className="text-sm font-medium leading-relaxed">{result.verification.comparison.actual_truth}</p>
              </div>
            </div>

            {/* Verified Sources */}
            <section>
              <div className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trusted Reports
              </div>
              <div className="space-y-4">
                {result.verification.articles.map((article, idx) => (
                  <div key={idx} className="group relative rounded-xl border border-border/50 bg-secondary/20 p-5 transition-all hover:border-success/30 hover:bg-success/5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-background text-[10px] font-bold uppercase">{article.source}</Badge>
                          {article.truth_score && (
                            <span className="text-[10px] font-medium text-success">Verified Accuracy: {Math.round(article.truth_score * 100)}%</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold leading-tight group-hover:text-success transition-colors">
                          {article.headline}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {article.summary}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0 group-hover:bg-success group-hover:text-white transition-all">
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          Read Full Report <Activity className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Final CTA Footer */}
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-success/5 border border-success/20 p-6 text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-success">Ready to confirm the truth?</h4>
                <p className="text-xs text-muted-foreground">We highly recommend reading the full report from the primary verified source.</p>
              </div>
              <Button asChild size="lg" className="bg-success hover:bg-success/90 text-white font-bold shadow-lg shadow-success/20 group">
                <a href={result.verification.articles[0].link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  Go to Official Verification <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold capitalize tabular-nums">{value}</div>
    </div>
  );
}
