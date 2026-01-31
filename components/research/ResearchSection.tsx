"use client";

import { Container } from "@/components/ui/Container";
import { PublicationCard } from "./PublicationCard";
import { publications } from "@/data/publications";

export function ResearchSection() {
  return (
    <section id="research" className="relative py-20">
      {/* Background Decor */}
      <div className="absolute left-0 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-900/20 blur-[100px]" />
      
      <Container>
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Research & <span className="text-purple-500">Publications</span>
          </h2>
          <p className="max-w-xl text-zinc-400">
            Pushing the boundaries of Automated Software Engineering and Resilient Cyber-Physical Systems.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      </Container>
    </section>
  );
}