"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skill, SkillCategory } from "@/data/skills";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  cyan: "bg-cyan-500",
};

export function FeaturedSkillCard({ 
  category, 
  skills 
}: { 
  category: SkillCategory; 
  skills: Skill[] 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const topSkills = skills.slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-zinc-700">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50", `text-${category.color}-400`)}>
          <category.icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-white">{category.name}</h3>
          <p className="text-xs text-zinc-500">{category.description}</p>
        </div>
      </div>

      {/* SKILL LIST */}
      <div className="space-y-3">
        {topSkills.map((skill) => (
          <div key={skill.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300">{skill.name}</span>
              <span className="text-zinc-500">{skill.proficiency}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div 
                className={cn("h-full rounded-full", COLOR_MAP[category.color] || "bg-zinc-500")} 
                style={{ width: `${skill.proficiency}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* EXPAND BUTTON */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        {isExpanded ? "Show Less" : "View Details"}
        <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
      </button>

      {/* EXPANDED CONTENT */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-zinc-800 space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="text-sm">
                   <div className="font-medium text-zinc-300">{skill.name}</div>
                   <div className="flex flex-wrap gap-1 mt-1">
                      {skill.subSkills.map(sub => (
                        <span key={sub} className="text-xs text-zinc-500 bg-zinc-900 px-1.5 rounded">{sub}</span>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}