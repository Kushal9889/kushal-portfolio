"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { experiences } from "@/data/experience";
import { cn } from "@/lib/utils";

export function Timeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="experience" className="relative py-20">
      <Container>
        {/* HEADER */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Professional <span className="text-blue-500">Experience</span>
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            Building scalable cloud infrastructure and AI-powered systems.
          </p>
        </div>

        {/* DESKTOP TIMELINE VISUALIZATION */}
        <div className="hidden md:block">
          <div className="relative mb-12 h-24">
            {/* Base Line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-zinc-800" />
            
            {/* Active Line (Animated) */}
            <motion.div 
              className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{ width: `${(activeIndex / (experiences.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Nodes */}
            <div className="absolute inset-0 flex justify-between items-center">
              {experiences.map((exp, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;

                return (
                  <button
                    key={exp.id}
                    onClick={() => setActiveIndex(index)}
                    className="relative group focus:outline-none"
                  >
                    {/* Label (Top) */}
                    <div className={cn(
                      "absolute bottom-full mb-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium transition-colors",
                      isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      {exp.startDate}
                    </div>

                    {/* Circle Node */}
                    <div className={cn(
                      "relative z-10 h-4 w-4 rounded-full border-2 transition-all duration-300",
                      isActive 
                        ? "bg-blue-500 border-blue-500 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                        : isPast 
                          ? "bg-blue-500 border-blue-500" 
                          : "bg-zinc-950 border-zinc-700 group-hover:border-zinc-500"
                    )} />

                    {/* Company Name (Bottom) */}
                    <div className={cn(
                      "absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium transition-colors",
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      {exp.company}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* EXPERIENCE CARD DISPLAY */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 md:p-10">
                <div className="flex flex-col gap-8 md:flex-row">
                  
                  {/* LEFT COLUMN: Details */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{experiences[activeIndex].company}</h3>
                      <p className="text-lg text-blue-400">{experiences[activeIndex].role}</p>
                      <p className="mt-1 text-sm text-zinc-500 font-mono">
                        {experiences[activeIndex].startDate} - {experiences[activeIndex].endDate} • {experiences[activeIndex].location}
                      </p>
                    </div>

                    <p className="text-zinc-400 leading-relaxed">
                      {experiences[activeIndex].description}
                    </p>

                    <ul className="space-y-3">
                      {experiences[activeIndex].achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-3 text-zinc-300">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                          <span className="text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {experiences[activeIndex].techStack.map((tech) => (
                        <span 
                          key={tech} 
                          className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-xs font-medium text-zinc-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Metrics Grid */}
                  <div className="grid grid-cols-1 gap-4 md:w-64 md:grid-cols-1">
                    {experiences[activeIndex].metrics.map((metric, i) => (
                      <div 
                        key={i} 
                        className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center transition-colors hover:bg-zinc-900/50"
                      >
                        <metric.icon className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>

      </Container>
    </section>
  );
}