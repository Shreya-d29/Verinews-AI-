import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [dark, setDark] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const saved = localStorage.getItem("verinews:theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("verinews:theme", next ? "dark" : "light");
  };

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-foreground ${
        location.pathname === to ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            VeriNews <span className="text-gradient">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navItem("/", "Home")}
          {navItem("/analyze", "Analyzer")}
          {navItem("/history", "History")}
          {navItem("/settings", "Settings")}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/analyze">Analyze article</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
