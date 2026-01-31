"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Publication } from "@/data/publications";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge"; // Ensure you have a Badge or use standard div
import { ArrowUpRight, ChevronDown, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicationCard({ pub }: { pub: Publication }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <GlassCard 
        className="group relative overflow-hidden border-zinc-800 bg-zinc-900/40 p-0 hover:border-purple-500/50 transition-colors duration-500"
        hover={false} // We handle hover manually for the purple effect
      >
        {/* PURPLE GLOW EFFECT */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />

        <div className="p-6 md:p-8">
          {/* HEADER ZONE */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                <span>{pub.conference}</span>
                <span>•</span>
                <span>{pub.date}</span>
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-purple-300">
                  {pub.role}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-100 transition-colors">
                {pub.title}
              </h3>
            </div>
            
            <a 
              href={pub.links.paper} 
              target="_blank" 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-purple-500 hover:bg-purple-500 hover:text-white transition-all"
            >
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </div>

          {/* IMPACT ZONE */}
          <div className="mb-6 rounded-lg border border-purple-500/20 bg-purple-900/10 p-3">
            <p className="text-sm font-medium text-purple-200">
              ⚡ <span className="text-purple-100">Impact:</span> {pub.impact}
            </p>
          </div>

          {/* CONTRIBUTIONS (ALWAYS VISIBLE) */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {pub.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-zinc-400">#{tag}</span>
              ))}
            </div>
            
            <ul className="space-y-2 text-sm text-zinc-400">
              {pub.contributions.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* TECH STACK */}
          <div className="mt-6 flex flex-wrap gap-2">
            {pub.techStack.map((tech) => (
              <span key={tech} className="rounded-md border border-cyan-900/30 bg-cyan-950/30 px-2 py-1 text-[10px] font-medium text-cyan-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* EXPANDABLE METHODOLOGY ZONE */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-800 bg-zinc-900/50"
            >
              <div className="space-y-4 p-6 text-sm">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-purple-400">THE PROBLEM</p>
                    <p className="text-zinc-300">{pub.methodology.problem}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-purple-400">OUR APPROACH</p>
                    <p className="text-zinc-300">{pub.methodology.approach}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-purple-400">THE RESULT</p>
                    <p className="text-zinc-300">{pub.methodology.result}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EXPAND TRIGGER BUTTON */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-center gap-2 border-t border-zinc-800 bg-zinc-900/30 py-3 text-xs font-medium text-zinc-500 hover:bg-zinc-800/50 hover:text-purple-400 transition-colors"
        >
          {isExpanded ? "Hide Methodology" : "View Methodology & Deep Dive"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        </button>

      </GlassCard>
    </motion.div>
  );
}