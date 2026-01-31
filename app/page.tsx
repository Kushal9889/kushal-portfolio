"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Github, Linkedin, Star, ExternalLink, FileText, Briefcase, Code, Award, User } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";

const sections = [
  { id: "experience", name: "Professional Experience", icon: Briefcase, color: "#60a5fa" },
  { id: "research", name: "Research", icon: FileText, color: "#10b981" },
  { id: "projects", name: "Projects", icon: Code, color: "#a78bfa" },
  { id: "skills", name: "Skills", icon: User, color: "#f59e0b" },
  { id: "certifications", name: "Certifications", icon: Award, color: "#ef4444" }
];

// Sample project data with media arrays
const projectsData = [
  {
    name: "SolarBuddy Platform",
    desc: "Distributed energy marketplace with Stripe Connect processing $50K+ transactions",
    detailedDesc: "A comprehensive distributed energy marketplace that connects solar energy producers with consumers. Built with a microservices architecture on AWS, the platform handles real-time energy trading, automated billing through Stripe Connect, and provides detailed analytics dashboards for both producers and consumers. The system processes over $50K in monthly transactions and serves 500+ active users.",
    tech: ["AWS", "Node.js", "React", "Stripe", "PostgreSQL", "Redis", "Docker"],
    github: "https://github.com/yourusername/solarbuddy",
    liveUrl: "https://solarbuddy-demo.com",
    achievements: [
      "Processed $50K+ in monthly transactions with 99.9% uptime",
      "Reduced energy trading costs by 30% through automated matching",
      "Implemented real-time pricing with WebSocket connections",
      "Built comprehensive admin dashboard with React and D3.js"
    ],
    media: [
      { type: "image", src: "/projects/solarbuddy/dashboard.jpg" },
      { type: "image", src: "/projects/solarbuddy/marketplace.jpg" },
      { type: "video", src: "/projects/solarbuddy/demo.mp4", thumbnail: "/projects/solarbuddy/demo-thumb.jpg" },
      { type: "image", src: "/projects/solarbuddy/mobile.jpg" }
    ]
  },
  {
    name: "Bug Detection AI",
    desc: "Hybrid transformer + GNN pipeline achieving 87% precision for automated bug detection",
    detailedDesc: "An advanced machine learning system that combines transformer models (CodeBERT) with Graph Neural Networks to detect bugs in source code. The hybrid approach analyzes both semantic code patterns and structural dependencies to achieve 87% precision and 82% recall on real-world codebases. Trained on 100K+ code samples from open-source repositories.",
    tech: ["PyTorch", "GNN", "CodeBERT", "Transformers", "Python", "Docker", "MLflow"],
    github: "https://github.com/yourusername/bug-detection-ai",
    achievements: [
      "Achieved 87% precision and 82% recall on bug detection",
      "Processed 100K+ code samples for training dataset",
      "Reduced false positive rate by 40% compared to traditional tools",
      "Published research paper at top-tier ML conference"
    ],
    media: [
      { type: "image", src: "/projects/bugai/architecture.jpg" },
      { type: "video", src: "/projects/bugai/demo.mp4", thumbnail: "/projects/bugai/demo-thumb.jpg" },
      { type: "image", src: "/projects/bugai/results.jpg" },
      { type: "image", src: "/projects/bugai/interface.jpg" }
    ]
  },
  {
    name: "Real-time Chat Platform",
    desc: "Scalable WebSocket-based chat with 10K+ concurrent users and message encryption",
    detailedDesc: "A high-performance real-time chat platform built with Node.js and Socket.io, supporting 10K+ concurrent users. Features include end-to-end encryption, file sharing, group chats, message history, and real-time typing indicators. Deployed on AWS with auto-scaling and Redis for session management.",
    tech: ["Node.js", "Socket.io", "React", "MongoDB", "Redis", "AWS", "WebRTC"],
    github: "https://github.com/yourusername/realtime-chat",
    liveUrl: "https://chat-platform-demo.com",
    achievements: [
      "Supports 10K+ concurrent users with sub-100ms latency",
      "Implemented end-to-end encryption for secure messaging",
      "Built file sharing with drag-and-drop interface",
      "Achieved 99.95% uptime with auto-scaling infrastructure"
    ],
    media: [
      { type: "image", src: "/projects/chat/main-interface.jpg" },
      { type: "video", src: "/projects/chat/demo.mp4", thumbnail: "/projects/chat/demo-thumb.jpg" },
      { type: "image", src: "/projects/chat/mobile-view.jpg" },
      { type: "image", src: "/projects/chat/admin-panel.jpg" }
    ]
  },
  {
    name: "E-commerce Analytics Dashboard",
    desc: "React-based analytics platform processing 1M+ daily events with real-time insights",
    detailedDesc: "A comprehensive analytics dashboard for e-commerce businesses, processing over 1M daily events. Built with React and D3.js for interactive visualizations, the platform provides real-time insights into sales, customer behavior, and inventory management. Features predictive analytics using machine learning models.",
    tech: ["React", "D3.js", "Python", "FastAPI", "PostgreSQL", "Apache Kafka", "Docker"],
    github: "https://github.com/yourusername/ecommerce-analytics",
    achievements: [
      "Processes 1M+ daily events with real-time processing",
      "Reduced data processing time by 60% with optimized queries",
      "Built 15+ interactive visualization components",
      "Implemented predictive analytics with 85% accuracy"
    ],
    media: [
      { type: "image", src: "/projects/analytics/dashboard.jpg" },
      { type: "image", src: "/projects/analytics/charts.jpg" },
      { type: "video", src: "/projects/analytics/demo.mp4", thumbnail: "/projects/analytics/demo-thumb.jpg" },
      { type: "image", src: "/projects/analytics/mobile.jpg" }
    ]
  }
];

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("experience");
  const [isUserSelected, setIsUserSelected] = useState(false);

  // Auto-rotation every 2 seconds unless user has selected
  useEffect(() => {
    if (!isUserSelected) {
      const interval = setInterval(() => {
        setActiveSection(prev => {
          const currentIndex = sections.findIndex(s => s.id === prev);
          const nextIndex = (currentIndex + 1) % sections.length;
          return sections[nextIndex].id;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isUserSelected]);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsUserSelected(true);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#111827', color: 'white' }}>
      {/* TOP SECTION - Scrolls Away Normally */}
      <div style={{ padding: '3rem 0' }}>
        <div className="container">
          {/* Name & University */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#CC0000', borderRadius: '2px' }} />
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>
                KUSHAL GADDAMWAR
              </h1>
            </div>
            <p style={{ fontSize: '1.25rem', color: '#9ca3af', margin: 0 }}>
              MS Computer Science @ Boston University | Dec 2026 | GPA: 3.2
            </p>
          </div>

          {/* Credibility Row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap', 
            gap: '1rem', 
            marginBottom: '3rem' 
          }}>
            {/* GitHub */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(31, 41, 55, 0.5)',
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}>
              <Github style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
              <span style={{ fontSize: '1rem', fontWeight: '600' }}>12 repos</span>
              <Star style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '1rem', fontWeight: '600' }}>24 stars</span>
            </div>

            {/* Publications */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#10b981'
            }}>
              📄 2 Publications
            </div>

            {/* LinkedIn */}
            <a 
              href="https://linkedin.com/in/your-username" 
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: 'rgba(37, 99, 235, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '0.5rem',
                color: '#60a5fa',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <Linkedin style={{ width: '20px', height: '20px' }} />
              LinkedIn
            </a>

            {/* Resume */}
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}>
              <Download style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
              Resume
            </button>
          </div>

          {/* Top 2 Featured Projects */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Project 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                S
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                SolarBuddy Platform
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                Distributed energy marketplace with Stripe Connect processing $50K+ transactions
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {["AWS", "Node.js", "React", "Stripe"].map(tech => (
                  <span key={tech} style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: 'rgba(37, 99, 235, 0.1)', 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%' }}>
                <ExternalLink style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                Live Demo
              </button>
            </div>

            {/* Project 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                B
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Bug Detection AI
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                Hybrid transformer + GNN pipeline achieving 87% precision for automated bug detection
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {["PyTorch", "GNN", "CodeBERT", "Transformers"].map(tech => (
                  <span key={tech} style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    color: '#10b981', 
                    fontSize: '0.875rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
              <button className="btn-secondary" style={{ width: '100%' }}>
                <FileText style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                Research Paper
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY SECTION TABS - Enhanced UI/UX */}
      <div style={{ 
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))', 
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(96, 165, 250, 0.2)',
        borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
        padding: '1.5rem 0',
        zIndex: 50,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="container">
          {/* Section Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              const isNext = sections[(sections.findIndex(s => s.id === activeSection) + 1) % sections.length]?.id === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.75rem',
                    background: isActive 
                      ? `linear-gradient(135deg, ${section.color}25, ${section.color}15)` 
                      : 'rgba(31, 41, 55, 0.6)',
                    border: isActive 
                      ? `2px solid ${section.color}` 
                      : '2px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '1rem',
                    color: isActive ? section.color : '#9ca3af',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: '160px',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transform: isActive ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
                    boxShadow: isActive 
                      ? `0 8px 25px ${section.color}40, 0 0 0 1px ${section.color}20` 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = `rgba(${section.color === '#60a5fa' ? '96, 165, 250' : section.color === '#10b981' ? '16, 185, 129' : section.color === '#a78bfa' ? '167, 139, 250' : section.color === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`;
                      e.target.style.borderColor = `${section.color}60`;
                      e.target.style.color = section.color;
                      e.target.style.transform = 'translateY(-1px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'rgba(31, 41, 55, 0.6)';
                      e.target.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                      e.target.style.color = '#9ca3af';
                      e.target.style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                >
                  {/* Icon with enhanced styling */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: isActive ? `${section.color}20` : 'transparent',
                    transition: 'all 0.3s ease'
                  }}>
                    <section.icon style={{ 
                      width: '18px', 
                      height: '18px',
                      filter: isActive ? 'drop-shadow(0 0 4px currentColor)' : 'none'
                    }} />
                  </div>
                  
                  {/* Section name with better typography */}
                  <span style={{
                    letterSpacing: '0.025em',
                    textShadow: isActive ? `0 0 8px ${section.color}40` : 'none'
                  }}>
                    {section.name}
                  </span>
                  
                  {/* Progress indicator for auto-rotation */}
                  {!isUserSelected && isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${section.color}, ${section.color}80)`,
                      borderRadius: '0 0 1rem 1rem',
                      animation: 'progress 2s linear',
                      width: '100%',
                      boxShadow: `0 0 8px ${section.color}60`
                    }} />
                  )}
                  
                  {/* Next indicator */}
                  {!isUserSelected && isNext && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      right: '8px',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: section.color,
                      opacity: 0.6,
                      animation: 'pulse 1s infinite'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Enhanced Control Panel */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {/* Auto-rotation status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: isUserSelected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${isUserSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: isUserSelected ? '#fca5a5' : '#6ee7b7'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isUserSelected ? '#ef4444' : '#10b981',
                animation: isUserSelected ? 'none' : 'pulse 2s infinite'
              }} />
              {isUserSelected ? 'Manual Mode' : 'Auto-Rotating'}
            </div>
            
            {/* Reset button with enhanced design */}
            {isUserSelected && (
              <button
                onClick={() => setIsUserSelected(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid currentColor',
                  borderRadius: '50%',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }} />
                Resume Auto-Rotation
              </button>
            )}
            
            {/* Section counter */}
            <div style={{
              padding: '0.5rem 1rem',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#93c5fd',
              fontWeight: '500'
            }}>
              {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div style={{ minHeight: '100vh', padding: '3rem 0' }}>
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SectionContent sectionId={activeSection} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Enhanced button hover effects */
        .nav-button {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-button:hover {
          transform: translateY(-2px) scale(1.02);
        }
        
        .nav-button.active {
          transform: translateY(-3px) scale(1.05);
          filter: drop-shadow(0 8px 25px rgba(96, 165, 250, 0.3));
        }
      `}</style>
    </main>
  );
}

// Enhanced Section Content with More Scrollable Content
function SectionContent({ sectionId }) {
  const content = {
    experience: (
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
          Professional <span className="gradient-text">Experience</span>
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* IMG Systems - Detailed */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem' }}>🏢</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  IMG Systems
                </h3>
                <p style={{ color: '#60a5fa', fontWeight: '600' }}>Software Development Engineer Intern</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Aug 2024 – Apr 2025 | Boston, MA</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#10b981', fontWeight: '600', marginBottom: '1rem' }}>IMPACT METRICS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>40%</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Deployment Time Reduction</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>10M+</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>API Requests/Day</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>99.9%</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>System Uptime</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>KEY ACHIEVEMENTS</h4>
              <ul style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Architected serverless microservices handling 10M+ daily requests with 99.9% uptime</li>
                <li style={{ marginBottom: '0.5rem' }}>• Implemented automated CI/CD pipeline reducing deployment cycles from 2 weeks to 2 hours</li>
                <li style={{ marginBottom: '0.5rem' }}>• Built Infrastructure as Code using Terraform with multi-environment support</li>
                <li style={{ marginBottom: '0.5rem' }}>• Created comprehensive monitoring dashboards with CloudWatch and custom metrics</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>TECH STACK</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {["AWS Lambda", "DynamoDB", "Python", "Docker", "Terraform", "GitHub Actions", "CloudWatch", "SQS"].map(tech => (
                  <span key={tech} style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'rgba(37, 99, 235, 0.1)', 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    borderRadius: '0.25rem',
                    fontFamily: 'monospace'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Growaza - Detailed */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem' }}>🌱</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Growaza Pvt. Ltd.
                </h3>
                <p style={{ color: '#60a5fa', fontWeight: '600' }}>Associate Software Development Engineer Intern</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Jan 2024 – Jul 2024 | Remote</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#10b981', fontWeight: '600', marginBottom: '1rem' }}>IMPACT METRICS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>60%</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>API Response Improvement</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>50K+</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Active Users</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>45%</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Query Time Reduction</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>KEY ACHIEVEMENTS</h4>
              <ul style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Optimized API endpoints reducing response time from 800ms to 320ms</li>
                <li style={{ marginBottom: '0.5rem' }}>• Implemented Redis caching layer with TTL-based invalidation strategies</li>
                <li style={{ marginBottom: '0.5rem' }}>• Built responsive React components with TypeScript for type safety</li>
                <li style={{ marginBottom: '0.5rem' }}>• Deployed containerized applications on Google Cloud Run with auto-scaling</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>TECH STACK</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {["Node.js", "PostgreSQL", "Redis", "React", "TypeScript", "Docker", "GCP", "Cloud Run"].map(tech => (
                  <span key={tech} style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'rgba(37, 99, 235, 0.1)', 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    borderRadius: '0.25rem',
                    fontFamily: 'monospace'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    
    research: (
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
          Research & <span className="gradient-text">Publications</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* Paper 1 - Detailed */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                <FileText style={{ width: '30px', height: '30px', color: '#10b981' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  Planning for Contextual Bug Detection and Automated Search in Software Systems
                </h3>
                <p style={{ color: '#10b981', marginBottom: '0.5rem', fontWeight: '600' }}>First Author | June 2024 | Published</p>
                <p style={{ color: '#cbd5e1', fontSize: '1.125rem', lineHeight: '1.6' }}>
                  Designed hybrid transformer + GNN pipeline for real-time bug detection with automated fix retrieval, enabling self-healing CI/CD systems.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#10b981', fontWeight: '600', marginBottom: '1rem' }}>TECHNICAL CONTRIBUTIONS</h4>
              <ul style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>• Built context-aware bug classifier (Random Forest, XGBoost) achieving <strong>87% precision@10</strong></li>
                <li style={{ marginBottom: '0.75rem' }}>• Designed semantic code search engine using CodeBERT embeddings with <strong>0.73 MRR score</strong></li>
                <li style={{ marginBottom: '0.75rem' }}>• Integrated runtime trace mining with AST analysis for latent bug discovery</li>
                <li style={{ marginBottom: '0.75rem' }}>• Validated on <strong>15K+ real-world bug datasets</strong> (GitHub, Stack Overflow)</li>
              </ul>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>METHODOLOGY</h4>
              <div style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '1.5rem', borderRadius: '0.5rem', fontSize: '0.95rem', lineHeight: '1.7', color: '#9ca3af' }}>
                <p style={{ marginBottom: '1rem' }}>
                  Collected 15K+ bug reports from GitHub Issues and Stack Overflow with manual labeling for ground truth validation.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  Implemented dual-encoder architecture: CodeBERT for semantic understanding + Graph Neural Networks for structural code analysis.
                </p>
                <p>
                  Applied reinforcement learning for automated fix suggestion ranking with human feedback loop integration.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {["PyTorch", "Transformers", "Graph Neural Networks", "CodeBERT", "Reinforcement Learning", "AST Analysis"].map(tech => (
                <span key={tech} style={{ 
                  padding: '0.5rem 1rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  fontSize: '0.875rem', 
                  borderRadius: '0.25rem',
                  fontFamily: 'monospace'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          {/* Paper 2 - Detailed */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                <FileText style={{ width: '30px', height: '30px', color: '#10b981' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  Cyber-Physical Systems and the Future of Urban Living
                </h3>
                <p style={{ color: '#10b981', marginBottom: '0.5rem', fontWeight: '600' }}>Co-Author | March 2024 | Book Chapter</p>
                <p style={{ color: '#cbd5e1', fontSize: '1.125rem', lineHeight: '1.6' }}>
                  Architected edge-computing CPS framework for smart city governance, optimizing traffic flow, energy distribution, and environmental monitoring.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#10b981', fontWeight: '600', marginBottom: '1rem' }}>TECHNICAL CONTRIBUTIONS</h4>
              <ul style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>• Modeled CPS workflows using <strong>Digital Twins</strong> for policy simulation before deployment</li>
                <li style={{ marginBottom: '0.75rem' }}>• Applied Bayesian networks + MDPs for uncertainty modeling in urban decision-making</li>
                <li style={{ marginBottom: '0.75rem' }}>• Proposed multi-agent systems for decentralized traffic/energy coordination</li>
                <li style={{ marginBottom: '0.75rem' }}>• Evaluated QoS metrics (<strong>latency &lt;50ms</strong>) for real-time sensor-actuator networks</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {["Edge Computing", "IoT", "Multi-Agent Systems", "Bayesian Networks", "Digital Twins", "UML Modeling"].map(tech => (
                <span key={tech} style={{ 
                  padding: '0.5rem 1rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  fontSize: '0.875rem', 
                  borderRadius: '0.25rem',
                  fontFamily: 'monospace'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    
    projects: (
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
          All <span className="gradient-text">Projects</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {projectsData.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>
      </div>
    ),
    
    skills: (
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
          Technical <span className="gradient-text">Skills</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { 
              category: "Cloud Platforms", 
              skills: [
                { name: "AWS", level: 90, years: "2+" },
                { name: "Google Cloud", level: 75, years: "1+" },
                { name: "Azure", level: 60, years: "1" }
              ], 
              color: "#60a5fa" 
            },
            { 
              category: "AI/ML Frameworks", 
              skills: [
                { name: "PyTorch", level: 85, years: "2+" },
                { name: "TensorFlow", level: 70, years: "1+" },
                { name: "HuggingFace", level: 80, years: "1+" }
              ], 
              color: "#10b981" 
            },
            { 
              category: "Programming Languages", 
              skills: [
                { name: "Python", level: 95, years: "4+" },
                { name: "JavaScript/TypeScript", level: 85, years: "2+" },
                { name: "Go", level: 70, years: "1+" }
              ], 
              color: "#a78bfa" 
            },
            { 
              category: "Databases & Storage", 
              skills: [
                { name: "PostgreSQL", level: 80, years: "2+" },
                { name: "MongoDB", level: 75, years: "1+" },
                { name: "Redis", level: 85, years: "1+" }
              ], 
              color: "#f59e0b" 
            }
          ].map(group => (
            <div key={group.category} className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: group.color, textAlign: 'center' }}>
                {group.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {group.skills.map(skill => (
                  <div key={skill.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500' }}>{skill.name}</span>
                      <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{skill.years} years</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${skill.level}%`, 
                          height: '100%', 
                          background: group.color, 
                          borderRadius: '3px',
                          transition: 'width 1s ease-out'
                        }} 
                      />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {skill.level}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    
    certifications: (
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
          <span className="gradient-text">Certifications</span> & Credentials
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { name: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", color: "#FF9900", status: "Active", year: "2024" },
            { name: "Google Cloud Professional Cloud Architect", issuer: "Google Cloud", color: "#4285F4", status: "In Progress", year: "2024" },
            { name: "Azure Fundamentals AZ-900", issuer: "Microsoft", color: "#0078D4", status: "Active", year: "2024" },
            { name: "Machine Learning Specialization", issuer: "Coursera", color: "#0056D3", status: "Completed", year: "2023" }
          ].map(cert => (
            <div key={cert.name} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 1.5rem',
                background: `${cert.color}20`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${cert.color}40`
              }}>
                <Award style={{ width: '40px', height: '40px', color: cert.color }} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                {cert.name}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {cert.issuer}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  background: `${cert.color}20`, 
                  color: cert.color, 
                  fontSize: '0.75rem', 
                  borderRadius: '9999px',
                  fontWeight: '600'
                }}>
                  {cert.status}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  {cert.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return content[sectionId] || <div>Section not found</div>;
}