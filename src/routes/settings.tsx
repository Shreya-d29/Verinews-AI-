import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Server, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFlaskEndpoint, setFlaskEndpoint } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VeriNews AI" },
      { name: "description", content: "Connect your Flask ML model endpoint to VeriNews AI." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [endpoint, setEndpoint] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setEndpoint(getFlaskEndpoint());
  }, []);

  const save = () => {
    try {
      if (endpoint) new URL(endpoint);
      setFlaskEndpoint(endpoint.trim());
      toast.success(endpoint ? "Endpoint saved" : "Endpoint cleared (using demo mode)");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const test = async () => {
    if (!endpoint) {
      toast.error("Enter an endpoint first");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(endpoint.replace(/\/$/, "") + "/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "This is a test message." }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Connected — got prediction: ${data.prediction}`);
      } else {
        toast.error(`Endpoint returned ${res.status}`);
      }
    } catch (e: any) {
      toast.error(`Connection failed: ${e?.message || "unknown error"}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">Connect VeriNews AI to your hosted Flask ML service.</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Flask ML endpoint</h2>
            <p className="text-sm text-muted-foreground">
              VeriNews will POST <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{`{ text, source }`}</code> to{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/predict</code> on this base URL and expect{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{`{ prediction, confidence, explanation }`}</code> in return.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="endpoint">Base URL</Label>
          <Input
            id="endpoint"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder="https://your-flask-app.example.com"
            className="mt-1.5 font-mono text-sm"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Leave empty to use the built-in NLP demo classifier. Stored locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} className="gap-2">
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button variant="outline" onClick={test} disabled={testing}>
            {testing ? "Testing…" : "Test connection"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => { setEndpoint(""); setFlaskEndpoint(""); toast.success("Cleared"); }}
            className="gap-2 text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <h2 className="font-display text-lg font-semibold">Expected Flask handler</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Make sure your Flask service enables CORS for this origin and exposes a POST <code className="font-mono">/predict</code> route.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed">
{`from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

@app.post("/predict")
def predict():
    data = request.get_json()
    text = data.get("text", "")
    X = vectorizer.transform([text])
    proba = model.predict_proba(X)[0]
    label = "Fake" if proba[0] > proba[1] else "Real"
    confidence = float(max(proba))
    return jsonify({
        "prediction": label,
        "confidence": confidence,
        "explanation": f"ML model classified as {label}"
    })`}
        </pre>
      </div>
    </main>
  );
}
