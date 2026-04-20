import { Brain, Mic } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
        <Brain className="h-5 w-5 text-white absolute opacity-90" strokeWidth={2.2} />
        <Mic className="h-3 w-3 text-white absolute bottom-1 right-1" strokeWidth={2.5} />
      </div>
      <span className="text-lg font-bold tracking-tight">
        Meet<span className="text-gradient-brand">Mind</span>
      </span>
    </Link>
  );
}
