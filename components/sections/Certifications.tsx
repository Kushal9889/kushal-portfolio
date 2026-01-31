"use client";

import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { certifications } from "@/data/certifications";
import { ExternalLink, Award } from "lucide-react";

export function Certifications() {
  return (
    <section className="py-24 relative overflow-hidden">
      <Container>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-blue-500/10 rounded-lg">
               <Award className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold">Certifications</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <ScrollReveal key={cert.id} delay={index * 0.1}>
              <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                <GlassCard className="h-full flex flex-col items-center text-center p-6 hover:border-blue-500/50 group">
                  <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 p-3">
                    <img src={cert.logo} alt={cert.name} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-zinc-500 mb-4">{cert.issuer}</p>
                  
                  <div className="mt-auto flex items-center gap-1 text-xs font-medium text-blue-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Verify Credential <ExternalLink className="w-3 h-3" />
                  </div>
                </GlassCard>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}