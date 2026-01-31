"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, Github, X } from "lucide-react";

export function ProjectCard({ project }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [detailMediaIndex, setDetailMediaIndex] = useState(0);

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % project.media.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + project.media.length) % project.media.length);
  };

  const nextDetailMedia = () => {
    setDetailMediaIndex((prev) => (prev + 1) % project.media.length);
  };

  const prevDetailMedia = () => {
    setDetailMediaIndex((prev) => (prev - 1 + project.media.length) % project.media.length);
  };

  const currentMedia = project.media[currentMediaIndex];
  const currentDetailMedia = project.media[detailMediaIndex];

  return (
    <>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Media Carousel */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#1f2937' }}>
          {currentMedia.type === 'video' ? (
            <video
              src={currentMedia.src}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              poster={currentMedia.thumbnail}
            />
          ) : (
            <img
              src={currentMedia.src}
              alt={`${project.name} screenshot ${currentMediaIndex + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Navigation Arrows */}
          {project.media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                <ChevronLeft style={{ width: '20px', height: '20px' }} />
              </button>

              <button
                onClick={nextMedia}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                <ChevronRight style={{ width: '20px', height: '20px' }} />
              </button>
            </>
          )}

          {/* Media Indicators */}
          {project.media.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.5rem'
            }}>
              {project.media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentMediaIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          )}

          {/* Video Play Indicator */}
          {currentMedia.type === 'video' && (
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'white',
              fontSize: '0.75rem'
            }}>
              <Play style={{ width: '12px', height: '12px' }} />
              Video
            </div>
          )}
        </div>

        {/* Project Details */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
              {project.name}
            </h3>
            <a 
              href={project.github} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'rgba(107, 114, 128, 0.1)',
                borderRadius: '50%',
                color: '#9ca3af',
                textDecoration: 'none'
              }}
            >
              <Github style={{ width: '16px', height: '16px' }} />
            </a>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '1rem', lineHeight: '1.5' }}>
            {project.desc}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {project.tech.map(tech => (
              <span key={tech} style={{ 
                padding: '0.25rem 0.75rem', 
                background: 'rgba(37, 99, 235, 0.1)', 
                color: '#60a5fa', 
                fontSize: '0.75rem', 
                borderRadius: '0.25rem' 
              }}>
                {tech}
              </span>
            ))}
          </div>
          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => setShowDetails(true)}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Project Details Popup */}
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
            maxWidth: '900px',
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

            {/* Media Carousel in Popup */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111827' }}>
              {currentDetailMedia.type === 'video' ? (
                <video
                  src={currentDetailMedia.src}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }}
                  poster={currentDetailMedia.thumbnail}
                />
              ) : (
                <img
                  src={currentDetailMedia.src}
                  alt={`${project.name} screenshot ${detailMediaIndex + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }}
                />
              )}

              {/* Navigation Arrows */}
              {project.media.length > 1 && (
                <>
                  <button
                    onClick={prevDetailMedia}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft style={{ width: '24px', height: '24px' }} />
                  </button>

                  <button
                    onClick={nextDetailMedia}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight style={{ width: '24px', height: '24px' }} />
                  </button>
                </>
              )}

              {/* Media Indicators */}
              {project.media.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  {project.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setDetailMediaIndex(index)}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: 'none',
                        background: index === detailMediaIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Project Details Content */}
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                {project.name}
              </h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#60a5fa' }}>
                  Project Overview
                </h3>
                <p style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {project.detailedDesc}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
                  Key Achievements
                </h3>
                <ul style={{ color: '#d1d5db', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                  {project.achievements.map((achievement, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{achievement}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#a78bfa' }}>
                  Technologies Used
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {project.tech.map(tech => (
                    <span key={tech} style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'rgba(37, 99, 235, 0.1)', 
                      color: '#60a5fa', 
                      fontSize: '0.875rem', 
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(37, 99, 235, 0.2)'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(107, 114, 128, 0.1)',
                    border: '1px solid rgba(107, 114, 128, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  <Github style={{ width: '20px', height: '20px' }} />
                  View on GitHub
                </a>
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}