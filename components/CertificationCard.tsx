"use client";

import { useState } from "react";
import { X, ExternalLink, Calendar, Award } from "lucide-react";

export function CertificationCard({ certification }) {
  const [showDetails, setShowDetails] = useState(false);

  const maxVisibleSkills = 4;
  const visibleSkills = certification.skillsGained.slice(0, maxVisibleSkills);
  const hiddenSkillsCount = certification.skillsGained.length - maxVisibleSkills;

  return (
    <>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Organization Logo */}
        <div style={{ 
          position: 'relative', 
          height: '120px', 
          background: 'linear-gradient(135deg, #1f2937, #374151)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <img
            src={certification.organizationLogo}
            alt={`${certification.organization} logo`}
            style={{ 
              maxWidth: '80%', 
              maxHeight: '80%', 
              objectFit: 'contain',
              filter: 'brightness(1.1)'
            }}
          />
        </div>

        {/* Certification Details */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              margin: '0 0 0.5rem 0',
              lineHeight: '1.3'
            }}>
              {certification.name}
            </h3>
            <p style={{ 
              color: certification.color, 
              fontSize: '0.9rem', 
              fontWeight: '600',
              margin: '0 0 0.5rem 0'
            }}>
              {certification.organization}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#9ca3af',
              fontSize: '0.85rem'
            }}>
              <Calendar style={{ width: '14px', height: '14px' }} />
              <span>{certification.issueDate}</span>
              <span style={{ 
                padding: '0.2rem 0.6rem',
                background: `${certification.color}20`,
                color: certification.color,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {certification.status}
              </span>
            </div>
          </div>

          {/* Skills Gained */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              marginBottom: '0.75rem',
              color: '#d1d5db'
            }}>
              Skills Gained
            </h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {visibleSkills.map(skill => (
                <span key={skill} style={{ 
                  padding: '0.3rem 0.7rem', 
                  background: `${certification.color}15`, 
                  color: certification.color, 
                  fontSize: '0.75rem', 
                  borderRadius: '0.3rem',
                  border: `1px solid ${certification.color}30`
                }}>
                  {skill}
                </span>
              ))}
              {hiddenSkillsCount > 0 && (
                <span style={{ 
                  padding: '0.3rem 0.7rem', 
                  background: 'rgba(107, 114, 128, 0.2)', 
                  color: '#9ca3af', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.3rem',
                  border: '1px solid rgba(107, 114, 128, 0.3)'
                }}>
                  +{hiddenSkillsCount}
                </span>
              )}
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', fontSize: '0.9rem' }}
            onClick={() => setShowDetails(true)}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Certification Details Popup */}
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
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

            {/* Organization Logo Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #111827, #1f2937)',
              padding: '2rem',
              borderRadius: '1rem 1rem 0 0',
              textAlign: 'center'
            }}>
              <img
                src={certification.organizationLogo}
                alt={`${certification.organization} logo`}
                style={{ 
                  maxWidth: '120px', 
                  maxHeight: '80px', 
                  objectFit: 'contain',
                  marginBottom: '1rem'
                }}
              />
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem', 
                color: 'white' 
              }}>
                {certification.name}
              </h2>
              <p style={{ 
                color: certification.color, 
                fontSize: '1.1rem', 
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {certification.organization}
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '1rem',
                color: '#9ca3af',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  <span>{certification.issueDate}</span>
                </div>
                <span style={{ 
                  padding: '0.3rem 0.8rem',
                  background: `${certification.color}20`,
                  color: certification.color,
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {certification.status}
                </span>
              </div>
            </div>

            {/* Certification Content */}
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem', 
                  color: '#60a5fa' 
                }}>
                  What I Learned
                </h3>
                <p style={{ 
                  color: '#d1d5db', 
                  lineHeight: '1.6', 
                  marginBottom: '1rem',
                  fontSize: '1rem'
                }}>
                  {certification.description}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem', 
                  color: '#10b981' 
                }}>
                  Key Achievements
                </h3>
                <ul style={{ 
                  color: '#d1d5db', 
                  lineHeight: '1.6', 
                  paddingLeft: '1.5rem',
                  margin: 0
                }}>
                  {certification.keyLearnings.map((learning, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {learning}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem', 
                  color: '#a78bfa' 
                }}>
                  Skills Gained
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {certification.skillsGained.map(skill => (
                    <span key={skill} style={{ 
                      padding: '0.5rem 1rem', 
                      background: `${certification.color}15`, 
                      color: certification.color, 
                      fontSize: '0.875rem', 
                      borderRadius: '0.5rem',
                      border: `1px solid ${certification.color}30`
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verify Certificate Button */}
              <div style={{ textAlign: 'center' }}>
                <a 
                  href={certification.verificationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 2rem',
                    background: `linear-gradient(135deg, ${certification.color}, ${certification.color}CC)`,
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 15px ${certification.color}40`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 6px 20px ${certification.color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 4px 15px ${certification.color}40`;
                  }}
                >
                  <Award style={{ width: '20px', height: '20px' }} />
                  Verify Certificate
                  <ExternalLink style={{ width: '16px', height: '16px' }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}