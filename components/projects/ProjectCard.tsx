"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/data/projects";
import { GlassCard } from "@/components/ui/GlassCard";
import { Github, ExternalLink, ChevronDown, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border transition-all duration-500",
        isHovered && "scale-[1.03] border-accent-success/40 shadow-glass-hover"
      )}>
        {/* ENHANCED MEDIA PREVIEW AREA */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-dark-elevated to-dark-surface">
          {/* Enhanced Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white">{project.title}</h4>
                <p className="text-sm text-dark-text-tertiary">Interactive Preview</p>
              </div>
            </div>
          </div>
          
          {/* Animated Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
          
          {/* Floating Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 flex justify-between"
          >
             {project.metrics.slice(0, 2).map((m, i) => (
               <div key={i} className="flex items-center gap-2 rounded-full bg-dark-bg/80 backdrop-blur-xl px-3 py-1.5 text-xs font-semibold text-accent-success border border-accent-success/20">
                 <m.icon className="h-3 w-3" />
                 <span>{m.value}</span>
               </div>
             ))}
          </motion.div>
        </div>

        {/* ENHANCED CONTENT AREA */}
        <div className="flex flex-1 flex-col p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className={cn(
                "text-xl font-bold transition-all duration-300",
                isHovered ? "gradient-text-success" : "text-white"
              )}>
                {project.title}
              </h3>
              <p className="text-dark-text-secondary leading-relaxed line-clamp-2">
                {project.tagline}
              </p>
            </div>
          </div>

          {/* Enhanced Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech, index) => (
              <motion.span 
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-accent-success/20 to-accent-primary/20 text-accent-success border border-accent-success/20 hover:border-accent-success/40 transition-colors"
              >
                {tech}
              </motion.span>
            ))}
            {project.techStack.length > 4 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium text-dark-text-tertiary bg-dark-elevated border border-dark-border">
                +{project.techStack.length - 4} more
              </span>
            )}
          </div>

          {/* ENHANCED ACTION BUTTONS */}
          <div className="flex items-center gap-3 pt-2">
            {project.links.github && (
              <motion.a 
                href={project.links.github} 
                target="_blank"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated border border-dark-border text-dark-text-secondary hover:border-accent-primary/50 hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-300"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium">Code</span>
              </motion.a>
            )}
            {project.links.demo && (
              <motion.a 
                href={project.links.demo} 
                target="_blank"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-success text-white hover:shadow-glow-lg transition-all duration-300"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm font-medium">Live Demo</span>
              </motion.a>
            )}
            <div className="flex-1" />
            <motion.button 
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.05 }}
              className="group/btn flex items-center gap-2 text-sm font-medium text-dark-text-tertiary hover:text-accent-success transition-colors"
            >
              <span>{isExpanded ? "Hide" : "Details"}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isExpanded && "rotate-180")} />
            </motion.button>
          </div>

          {/* ENHANCED EXPANDABLE SECTION */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border-t border-glass-border pt-4">
                  <div className="space-y-3">
                     <h4 className="flex items-center gap-2 text-sm font-semibold gradient-text-success">
                       <Layers className="h-4 w-4" /> 
                       ARCHITECTURE
                     </h4>
                     <ul className="space-y-2 pl-4">
                        {project.expanded.architecture.map((item, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2 text-sm text-dark-text-secondary"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-success mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                     </ul>
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-sm font-semibold gradient-text-accent">THE CHALLENGE</h4>
                     <p className="text-sm text-dark-text-secondary leading-relaxed">{project.expanded.challenge}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Hover Glow Effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-success/10 to-accent-primary/10 opacity-0 transition-opacity duration-500 pointer-events-none",
          isHovered && "opacity-100"
        )} />
      </div>
    </motion.div>
  );
}