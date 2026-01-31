"use client";

import { motion } from "framer-motion";
import { Skill } from "@/data/skills";
import { cn } from "@/lib/utils";
import { Star, Zap, Target, Eye } from "lucide-react";

const LEVEL_CONFIGS = {
  expert: {
    color: "from-accent-success to-accent-primary",
    textColor: "text-accent-success",
    bgColor: "bg-accent-success/20",
    borderColor: "border-accent-success/30",
    icon: Star,
    glow: "shadow-glow"
  },
  advanced: {
    color: "from-accent-primary to-accent-secondary",
    textColor: "text-accent-primary",
    bgColor: "bg-accent-primary/20",
    borderColor: "border-accent-primary/30",
    icon: Zap,
    glow: "shadow-glow-sm"
  },
  intermediate: {
    color: "from-accent-warning to-accent-secondary",
    textColor: "text-accent-warning",
    bgColor: "bg-accent-warning/20",
    borderColor: "border-accent-warning/30",
    icon: Target,
    glow: ""
  },
  familiar: {
    color: "from-dark-text-tertiary to-dark-text-secondary",
    textColor: "text-dark-text-tertiary",
    bgColor: "bg-dark-elevated",
    borderColor: "border-dark-border",
    icon: Eye,
    glow: ""
  },
};

export function SkillCard({ skill }: { skill: Skill }) {
  const config = LEVEL_CONFIGS[skill.proficiencyLevel];
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border p-5 transition-all duration-300 cursor-pointer",
        "hover:border-accent-primary/40 hover:bg-glass-hover",
        config.glow
      )}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            config.bgColor,
            config.borderColor,
            "border"
          )}>
            <IconComponent className={cn("w-3 h-3", config.textColor)} />
          </div>
          <h3 className="font-bold text-white text-sm group-hover:gradient-text transition-all duration-300">
            {skill.name}
          </h3>
        </div>
      </div>

      {/* ENHANCED PROFICIENCY BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-semibold uppercase tracking-wider", config.textColor)}>
            {skill.proficiencyLevel}
          </span>
          <span className="text-xs text-dark-text-tertiary font-mono">
            {skill.proficiency}%
          </span>
        </div>
        
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-dark-elevated">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${skill.proficiency}%` }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              config.color
            )}
          />
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </div>

      {/* ENHANCED HOVER DETAILS */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute inset-0 flex flex-col justify-end bg-dark-bg/95 backdrop-blur-xl p-5 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-2">
              Specializations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skill.subSkills.slice(0, 3).map((sub, index) => (
                <motion.span 
                  key={sub}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-2 py-1 rounded-md bg-accent-primary/20 border border-accent-primary/30 text-[10px] font-medium text-accent-primary"
                >
                  {sub}
                </motion.span>
              ))}
              {skill.subSkills.length > 3 && (
                <span className="px-2 py-1 rounded-md bg-dark-elevated border border-dark-border text-[10px] font-medium text-dark-text-tertiary">
                  +{skill.subSkills.length - 3}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-dark-text-secondary">
              <span className="text-accent-secondary font-medium">Used in:</span> {skill.usedIn[0]}
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-accent-primary rounded-full animate-pulse" />
        <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-accent-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </motion.div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] [background-size:15px_15px]" />
      </div>
    </motion.div>
  );
}