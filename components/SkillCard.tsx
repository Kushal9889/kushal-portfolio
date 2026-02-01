"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";

export function SkillCard({ skillCategory }) {
  const [showDetails, setShowDetails] = useState(false);

  const visibleSkills = skillCategory.skills.slice(0, 4);
  const hiddenSkillsCount = skillCategory.skills.length - 4;

  return (
    <>
      <div 
        className="card" 
        style={{ 
          padding: '2rem', 
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setShowDetails(true)}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)';
          e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '';
        }}
      >
        {/* Category Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          margin: '0 auto 1.5rem',
          background: `linear-gradient(135deg, ${skillCategory.color}, ${skillCategory.color}CC)`,
          borderRadius: '1rem',
          boxShadow: `0 8px 25px ${skillCategory.color}40`
        }}>
          <skillCategory.icon style={{ width: '30px', height: '30px', color: 'white' }} />
        </div>

        {/* Category Title */}
        <h3 className="card-heading" style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: skillCategory.color,
          textAlign: 'center',
          position: 'relative'
        }}>
          {skillCategory.category}
        </h3>

        {/* Skills Preview */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {visibleSkills.map(skill => (
              <span key={skill.name} style={{
                padding: '0.4rem 0.8rem',
                background: `${skillCategory.color}15`,
                color: skillCategory.color,
                fontSize: '0.8rem',
                borderRadius: '0.4rem',
                border: `1px solid ${skillCategory.color}30`,
                fontWeight: '500'
              }}>
                {skill.name}
              </span>
            ))}
            {hiddenSkillsCount > 0 && (
              <span style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(107, 114, 128, 0.2)',
                color: '#9ca3af',
                fontSize: '0.8rem',
                borderRadius: '0.4rem',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                fontWeight: '500'
              }}>
                +{hiddenSkillsCount} more
              </span>
            )}
          </div>
        </div>

        {/* View Skills Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          background: `${skillCategory.color}20`,
          color: skillCategory.color,
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: `1px solid ${skillCategory.color}40`,
          backdropFilter: 'blur(10px)'
        }}>
          View Skills
          <ChevronRight style={{ width: '16px', height: '16px' }} />
        </div>
      </div>

      {/* Skills Details Popup */}
      {showDetails && (
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
            background: '#1f2937',
            borderRadius: '1rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
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
              background: `linear-gradient(135deg, ${skillCategory.color}20, ${skillCategory.color}10)`,
              padding: '2rem',
              borderRadius: '1rem 1rem 0 0',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                margin: '0 auto 1rem',
                background: `linear-gradient(135deg, ${skillCategory.color}, ${skillCategory.color}CC)`,
                borderRadius: '1rem',
                boxShadow: `0 8px 25px ${skillCategory.color}40`
              }}>
                <skillCategory.icon style={{ width: '40px', height: '40px', color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: 'white'
              }}>
                {skillCategory.category}
              </h2>
              <p style={{
                color: '#9ca3af',
                fontSize: '1rem'
              }}>
                {skillCategory.skills.length} skills mastered
              </p>
            </div>

            {/* Skills Grid */}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {skillCategory.skills.map(skill => (
                  <div key={skill.name} className="individual-skill-card" style={{
                    padding: '1rem',
                    background: 'rgba(31, 41, 55, 0.5)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${skillCategory.color}20`,
                    transition: 'all 0.3s var(--spring-ultra)',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span className="skill-name" style={{
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '1rem',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s var(--spring-ultra)'
                      }}>
                        {skill.name}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#9ca3af'
                      }}>
                        {skill.years} years
                      </span>
                    </div>
                    
                    {/* Dual Progress Bar - Theoretical vs Practical */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      {/* Progress Bar Container */}
                      <div style={{
                        width: '100%',
                        height: '12px',
                        background: '#374151',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid rgba(75, 85, 99, 0.3)'
                      }}>
                        {/* Theoretical Bar (Background) */}
                        <div className="knowledge-bar" style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${skill.theoretical}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${skillCategory.color}40, ${skillCategory.color}60)`,
                          borderRadius: '6px',
                          transition: 'all 1s ease-out',
                          border: `1px solid ${skillCategory.color}30`
                        }} />
                        
                        {/* Practical Bar (Foreground) */}
                        <div className="hands-on-bar" style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${skill.practical}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${skillCategory.color}, ${skillCategory.color}DD)`,
                          borderRadius: '6px',
                          transition: 'all 1.2s ease-out',
                          boxShadow: `0 0 12px ${skillCategory.color}50`
                        }} />
                      </div>
                      
                      {/* Simple Percentage Display */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem',
                        fontSize: '0.8rem'
                      }}>
                        <span style={{ color: `${skillCategory.color}80` }}>Knowledge: {skill.theoretical}%</span>
                        <span className="hands-on-highlight" style={{ 
                          color: '#ffffff', 
                          fontWeight: '700',
                          position: 'relative',
                          cursor: 'pointer'
                        }}>Hands-on: {skill.practical}%</span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#9ca3af'
                      }}>
                        {skill.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}