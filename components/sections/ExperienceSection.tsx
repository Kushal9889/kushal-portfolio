"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, MapPin, Calendar } from "lucide-react";

const experiences = [
  {
    id: "img-systems",
    company: "IMG Systems",
    logo: "🏢", // Replace with actual logo
    role: "Software Development Engineer Intern",
    period: "Aug 2024 – Apr 2025",
    location: "Boston, MA",
    type: "Full-time",
    metrics: [
      "Reduced deployment time by 40%",
      "Processed 10M+ API requests/day", 
      "Implemented CI/CD pipeline for 15+ microservices"
    ],
    techStack: ["AWS Lambda", "DynamoDB", "Python", "Docker", "Terraform", "GitHub Actions"],
    achievement: "Architected serverless microservices architecture handling 10M+ daily API requests with 99.9% uptime. Implemented automated deployment pipeline reducing release cycles from 2 weeks to 2 hours.",
    details: [
      "Built event-driven architecture using AWS Lambda + SQS for async processing",
      "Designed DynamoDB data models with GSI optimization for sub-50ms query performance", 
      "Implemented Infrastructure as Code using Terraform with multi-environment support",
      "Created comprehensive monitoring with CloudWatch + custom metrics dashboards"
    ]
  },
  {
    id: "growaza",
    company: "Growaza Pvt. Ltd.",
    logo: "🌱", // Replace with actual logo
    role: "Associate Software Development Engineer Intern",
    period: "Jan 2024 – Jul 2024",
    location: "Remote",
    type: "Internship",
    metrics: [
      "Improved API response time by 60%",
      "Built features used by 50K+ users",
      "Reduced database query time by 45%"
    ],
    techStack: ["Node.js", "PostgreSQL", "Redis", "React", "Docker", "GCP"],
    achievement: "Optimized core API endpoints serving 50K+ users, reducing average response time from 800ms to 320ms through database query optimization and Redis caching implementation.",
    details: [
      "Refactored N+1 query patterns using PostgreSQL joins and eager loading",
      "Implemented Redis caching layer with TTL-based invalidation strategies",
      "Built responsive React components with TypeScript for type safety",
      "Deployed containerized applications on Google Cloud Run with auto-scaling"
    ]
  }
];

export function ExperienceSection() {
  const [expandedCard, setExpandedCard] = useState(null);

  return (
    <section id="experience" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Professional <span className="gradient-text">Experience</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
            Building scalable systems and driving technical innovation across cloud platforms
          </p>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '2rem',
            bottom: '2rem',
            width: '2px',
            background: 'linear-gradient(to bottom, #60a5fa, #a78bfa)',
            transform: 'translateX(-50%)',
            zIndex: 1
          }} />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              style={{
                position: 'relative',
                marginBottom: '3rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '2rem'
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '2rem',
                width: '16px',
                height: '16px',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                borderRadius: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                border: '3px solid #111827'
              }} />

              {/* Experience Card */}
              <div 
                className="card card-hover"
                style={{
                  width: index % 2 === 0 ? 'calc(50% - 1rem)' : 'calc(50% - 1rem)',
                  marginLeft: index % 2 === 0 ? '0' : 'calc(50% + 1rem)',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedCard(expandedCard === exp.id ? null : exp.id)}
              >
                {/* Company Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>{exp.logo}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {exp.company}
                    </h3>
                    <p style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.875rem' }}>
                      {exp.role}
                    </p>
                  </div>
                  <ChevronDown 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: '#9ca3af',
                      transform: expandedCard === exp.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }} 
                  />
                </div>

                {/* Period & Location */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar style={{ width: '14px', height: '14px' }} />
                    {exp.period}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin style={{ width: '14px', height: '14px' }} />
                    {exp.location}
                  </div>
                </div>

                {/* Impact Metrics */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                    IMPACT METRICS
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {exp.metrics.map((metric, i) => (
                      <li key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ width: '4px', height: '4px', background: '#10b981', borderRadius: '50%' }} />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    TECH STACK
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {exp.techStack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(37, 99, 235, 0.1)',
                          color: '#60a5fa',
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

                {/* Key Achievement */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    KEY ACHIEVEMENT
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {exp.achievement}
                  </p>
                </div>

                {/* Expandable Details */}
                {expandedCard === exp.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ 
                      marginTop: '1rem', 
                      paddingTop: '1rem', 
                      borderTop: '1px solid #374151' 
                    }}
                  >
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#a78bfa' }}>
                      TECHNICAL DEEP-DIVE
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {exp.details.map((detail, i) => (
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
                            background: '#a78bfa', 
                            borderRadius: '50%',
                            marginTop: '0.5rem',
                            flexShrink: 0
                          }} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}