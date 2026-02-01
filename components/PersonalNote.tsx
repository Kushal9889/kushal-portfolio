"use client";

import { useState } from "react";
import { MessageCircle, X, Heart } from "lucide-react";

export function PersonalNote({ section }) {
  const [showNote, setShowNote] = useState(false);

  const notes = {
    experience: {
      title: "My Professional Journey",
      message: "Every role I've taken has been a stepping stone in my growth as a software engineer. From optimizing APIs at Growaza to architecting serverless systems at IMG Systems, I've always pushed myself to learn beyond the requirements. I believe in writing code that not only works but tells a story of thoughtful engineering. Each project taught me that the best solutions come from understanding both the technical challenges and the human needs behind them."
    },
    research: {
      title: "My Research Philosophy",
      message: "Research isn't just about publishing papers for me—it's about solving real problems that matter. When I worked on bug detection AI, I spent countless nights thinking about how developers struggle with debugging. My hybrid transformer + GNN approach wasn't just technically innovative; it was born from empathy for fellow programmers. I believe the best research bridges the gap between academic rigor and practical impact."
    },
    projects: {
      title: "Building with Purpose",
      message: "Each project you see here represents late nights, countless iterations, and a relentless pursuit of excellence. SolarBuddy wasn't just about processing transactions—it was about democratizing clean energy. My chat platform wasn't just about WebSockets—it was about connecting people meaningfully. I don't just build software; I craft experiences that make a difference in people's lives."
    },
    skills: {
      title: "My Learning Journey",
      message: "These skills weren't acquired overnight. Each percentage point represents hours of practice, failed deployments, and breakthrough moments. I learned AWS by breaking things in production (safely!), mastered PyTorch through 3 AM debugging sessions, and understood distributed systems by building them from scratch. My philosophy: learn by doing, fail fast, and never stop being curious. Every skill here has a story of persistence behind it."
    },
    certifications: {
      title: "Validation of Dedication",
      message: "These certifications represent more than just passing exams—they're proof of my commitment to continuous learning. I didn't just memorize for tests; I built real projects using these technologies. My AWS certification came after months of hands-on cloud architecture. Each cert validates not just knowledge, but the discipline to master complex systems. I believe in earning credentials through genuine expertise, not just test-taking skills."
    }
  };

  const currentNote = notes[section] || notes.skills;

  return (
    <>
      {/* Floating Note Button */}
      <button
        onClick={() => setShowNote(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(96, 165, 250, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1) translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(96, 165, 250, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(96, 165, 250, 0.4)';
        }}
        title="A note from Kushal"
      >
        <MessageCircle style={{ width: '24px', height: '24px' }} />
      </button>

      {/* Personal Note Popup */}
      {showNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowNote(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.2))',
              padding: '2rem 2rem 1rem 2rem',
              borderRadius: '1rem 1rem 0 0',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                borderRadius: '50%',
                boxShadow: '0 8px 25px rgba(96, 165, 250, 0.4)'
              }}>
                <Heart style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'white'
              }}>
                {currentNote.title}
              </h3>
              <p style={{
                color: '#60a5fa',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                A personal note from Kushal
              </p>
            </div>

            {/* Message Content */}
            <div style={{ padding: '2rem' }}>
              <p style={{
                color: '#d1d5db',
                lineHeight: '1.7',
                fontSize: '1rem',
                textAlign: 'left',
                fontStyle: 'italic'
              }}>
                "{currentNote.message}"
              </p>
              
              {/* Signature */}
              <div style={{
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(96, 165, 250, 0.2)',
                textAlign: 'right'
              }}>
                <p style={{
                  color: '#60a5fa',
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  — Kushal Gaddamwar
                </p>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.8rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  MS Computer Science @ Boston University
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}