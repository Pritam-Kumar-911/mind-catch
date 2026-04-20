import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/live", label: "Live Session" },
  { to: "/upload", label: "Upload" },
  { to: "/results", label: "Results" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground bg-accent/60" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-accent/40" }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild variant="brand" size="sm">
            <Link to="/live">Start Session</Link>
          </Button>
        </div>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent/50"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 px-4 py-3 space-y-1 glass">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-accent/60 text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
