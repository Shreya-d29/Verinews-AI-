import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearHistory, getHistory, type HistoryItem } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — VeriNews AI" },
      { name: "description", content: "Review your previous fake news analyses with confidence trends." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const stats = useMemo(() => {
    const fake = items.filter(i => i.prediction === "Fake").length;
    const real = items.length - fake;
    const avgConf = items.length
      ? items.reduce((s, i) => s + i.confidence, 0) / items.length
      : 0;
    return { fake, real, avgConf };
  }, [items]);

  const onClear = () => {
    clearHistory();
    setItems([]);
    toast.success("History cleared");
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Analysis history</h1>
          <p className="mt-2 text-muted-foreground">All analyses are stored locally in your browser.</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={onClear} className="gap-2">
            <Trash2 className="h-4 w-4" /> Clear history
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileX className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold">No analyses yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Run your first article through the analyzer to start building history.
          </p>
          <Button asChild className="mt-5">
            <Link to="/analyze">Open analyzer</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total analyses" value={String(items.length)} />
            <StatCard label="Fake" value={String(stats.fake)} accent="destructive" />
            <StatCard label="Real" value={String(stats.real)} accent="success" />
          </div>

          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-elegant">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Confidence over time</h2>
              <span className="text-xs text-muted-foreground">Avg {Math.round(stats.avgConf * 100)}%</span>
            </div>
            <ConfidenceChart items={[...items].reverse()} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Headline</th>
                  <th className="px-4 py-3 text-left font-medium">Verdict</th>
                  <th className="px-4 py-3 text-right font-medium">Confidence</th>
                  <th className="px-4 py-3 text-right font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id} className="border-t border-border/60">
                    <td className="px-4 py-3 max-w-md truncate">{i.headline}</td>
                    <td className="px-4 py-3">
                      <Badge variant={i.prediction === "Fake" ? "destructive" : "secondary"}>
                        {i.prediction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{Math.round(i.confidence * 100)}%</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(i.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "destructive" | "success" }) {
  const color = accent === "destructive" ? "text-destructive" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function ConfidenceChart({ items }: { items: HistoryItem[] }) {
  const w = 800, h = 140, pad = 16;
  if (items.length === 0) return null;
  const points = items.map((it, i) => {
    const x = pad + (i / Math.max(1, items.length - 1)) * (w - pad * 2);
    const y = h - pad - it.confidence * (h - pad * 2);
    return { x, y, fake: it.prediction === "Fake" };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.22 265)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 265)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${points.at(-1)!.x} ${h - pad} L ${points[0].x} ${h - pad} Z`} fill="url(#grad)" />
      <path d={path} fill="none" stroke="oklch(0.55 0.22 265)" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={p.fake ? "var(--color-destructive)" : "var(--color-success)"} />
      ))}
    </svg>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
