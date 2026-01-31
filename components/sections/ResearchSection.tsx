"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink, ChevronDown, Award, Users, Code } from "lucide-react";

const publications = [
  {
    id: "bug-detection",
    title: "Planning for Contextual Bug Detection and Automated Search in Software Systems",
    authors: "First Author",
    date: "June 2024",
    type: "Research Paper",
    status: "Published",
    link: "#", // Kushal to fill
    impact: "Designed hybrid transformer + GNN pipeline for real-time bug detection with automated fix retrieval, enabling self-healing CI/CD systems.",
    contributions: [
      "Built context-aware bug classifier (Random Forest, XGBoost) achieving 87% precision@10",
      "Designed semantic code search engine using CodeBERT embeddings with 0.73 MRR score", 
      "Integrated runtime trace mining with AST analysis for latent bug discovery",
      "Validated on 15K+ real-world bug datasets (GitHub, Stack Overflow)"
    ],
    techStack: ["PyTorch", "Transformers", "Graph Neural Networks", "CodeBERT", "Reinforcement Learning", "AST Analysis"],
    applications: ["Self-healing software", "CI/CD automation", "Developer productivity tools"],
    methodology: [
      "Collected 15K+ bug reports from GitHub Issues and Stack Overflow with manual labeling",
      "Implemented dual-encoder architecture: CodeBERT for semantic understanding + GNN for structural analysis",
      "Applied reinforcement learning for automated fix suggestion ranking with human feedback",
      "Evaluated using precision@k, recall@k, and MRR metrics across 5 programming languages"
    ]
  },
  {
    id: "cps-urban",
    title: "Cyber-Physical Systems and the Future of Urban Living",
    authors: "Co-Author",
    date: "March 2024", 
    type: "Book Chapter",
    status: "Published",
    link: "#", // Kushal to fill
    impact: "Architected edge-computing CPS framework for smart city governance, optimizing traffic flow, energy distribution, and environmental monitoring.",
    contributions: [
      "Modeled CPS workflows using Digital Twins for policy simulation before deployment",
      "Applied Bayesian networks + MDPs for uncertainty modeling in urban decision-making",
      "Proposed multi-agent systems for decentralized traffic/energy coordination", 
      "Evaluated QoS metrics (latency <50ms) for real-time sensor-actuator networks"
    ],
    techStack: ["Edge Computing", "IoT", "Multi-Agent Systems", "Bayesian Networks", "Digital Twins", "UML Modeling"],
    applications: ["Smart cities", "Adaptive governance", "Resilient infrastructure"],
    methodology: [
      "Designed multi-layer CPS architecture with edge nodes, fog computing, and cloud integration",
      "Implemented Markov Decision Processes for optimal resource allocation under uncertainty",
      "Simulated traffic flow optimization using SUMO with real Boston traffic data",
      "Validated latency requirements using discrete event simulation with 10K+ sensor nodes"
    ]
  }
];

export function ResearchSection() {
  const [expandedPaper, setExpandedPaper] = useState(null);

  return (
    <section id="research" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Research & <span className="gradient-text">Publications</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '700px', margin: '0 auto' }}>
            Advancing the state-of-the-art in automated software engineering and cyber-physical systems
          </p>
        </motion.div>

        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {publications.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="card card-hover"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpandedPaper(expandedPaper === paper.id ? null : paper.id)}
            >
              {/* Paper Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.5rem',
                  flexShrink: 0
                }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#10b981' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: '1.3', marginRight: '1rem' }}>
                      {paper.title}
                    </h3>
                    <ChevronDown 
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        color: '#9ca3af',
                        transform: expandedPaper === paper.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0
                      }} 
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Award style={{ width: '14px', height: '14px' }} />
                      {paper.authors}
                    </span>
                    <span>{paper.date}</span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {paper.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* One-Line Impact */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#60a5fa' }}>
                  ONE-LINE IMPACT
                </h4>
                <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.5', fontWeight: '500' }}>
                  {paper.impact}
                </p>
              </div>

              {/* Technical Contributions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  TECHNICAL CONTRIBUTIONS
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {paper.contributions.map((contribution, i) => (
                    <li key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.5rem', 
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#9ca3af'
                    }}>
                      <div style={{ 
                        width: '4px', 
                        height: '4px', 
                        background: '#10b981', 
                        borderRadius: '50%',
                        marginTop: '0.5rem',
                        flexShrink: 0
                      }} />
                      {contribution}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  TECH STACK
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {paper.techStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  APPLICATIONS
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {paper.applications.map((app) => (
                    <span
                      key={app}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(124, 58, 237, 0.1)',
                        color: '#a78bfa',
                        fontSize: '0.75rem',
                        borderRadius: '9999px'
                      }}
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                  Read Paper ↗
                </a>
              </div>

              {/* Expandable Methodology */}
              {expandedPaper === paper.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ 
                    marginTop: '1.5rem', 
                    paddingTop: '1.5rem', 
                    borderTop: '1px solid #374151' 
                  }}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
                    FULL METHODOLOGY
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {paper.methodology.map((method, i) => (
                      <li key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem', 
                        marginBottom: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#9ca3af'
                      }}>
                        <div style={{ 
                          width: '6px', 
                          height: '6px', 
                          background: '#f59e0b', 
                          borderRadius: '50%',
                          marginTop: '0.5rem',
                          flexShrink: 0
                        }} />
                        {method}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}