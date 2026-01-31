import { cn } from "@/lib/utils";

interface ShinyBadgeProps {
  text: string;
  className?: string;
}

export function ShinyBadge({ text, className }: ShinyBadgeProps) {
  return (
    <div
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-glass-border bg-glass-bg backdrop-blur-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-accent-primary/50",
        className
      )}
    >
      <span className="relative flex items-center gap-2 z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-success"></span>
        </span>
        {text}
      </span>
      
      {/* Enhanced Shimmer Effect */}
      <div className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%] skew-x-12" />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
    </div>
  );
}