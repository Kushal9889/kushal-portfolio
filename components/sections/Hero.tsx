"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, Github, Linkedin, Star, GitFork } from "lucide-react";
import { RESUME_DATA } from "@/data/resume-data";

export function Hero() {
  const [currentRole, setCurrentRole] = useState(0);
  const roles = ["Cloud + AI Architect", "Distributed Systems Engineer", "AI Engineering Lead"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '5rem' }}>
      <div className="container">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header with BU Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                background: '#CC0000', 
                borderRadius: '2px' 
              }} />
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                KUSHAL GADDAMWAR
              </h1>
            </div>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#9ca3af', 
              margin: 0,
              fontWeight: '500'
            }}>
              MS Computer Science @ Boston University | Dec 2026 | GPA: 3.2
            </p>
          </motion.div>

          {/* Dynamic Role + Research */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <motion.span
                key={currentRole}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="gradient-text"
              >
                {roles[currentRole]}
              </motion.span>
            </div>
            <p style={{ fontSize: '1rem', color: '#cbd5e1' }}>
              Research: Bug Detection · Cyber-Physical Systems
            </p>
          </motion.div>

          {/* Credibility Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}
          >
            {/* GitHub Stats */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(31, 41, 55, 0.5)',
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}>
              <Github style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: '600' }}>12</span> repos
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star style={{ width: '12px', height: '12px' }} />
                  <span style={{ fontWeight: '600' }}>24</span>
                </span>
              </div>
            </div>

            {/* AWS BUILD Badge */}
            <div style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #FF9900, #FF6600)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'white'
            }}>
              🏆 AWS BUILD Fellow
            </div>

            {/* Publications */}
            <div style={{
              padding: '0.5rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#10b981'
            }}>
              📄 2 Publications
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '1rem', 
              marginBottom: '3rem' 
            }}
          >
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
              <Download style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
              Resume ↓
            </button>
            <a 
              href="https://linkedin.com/in/your-username" 
              target="_blank"
              className="btn-secondary"
              style={{ textDecoration: 'none', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              <Linkedin style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
              LinkedIn
            </a>
            <a 
              href="https://github.com/your-username" 
              target="_blank"
              className="btn-secondary"
              style={{ textDecoration: 'none', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              <Github style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
              GitHub
            </a>
          </motion.div>

          {/* Featured Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem' 
            }}
          >
            {/* Featured Project */}
            <div className="card card-hover">
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Featured: SolarBuddy Platform
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Distributed energy marketplace with Stripe Connect
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(37, 99, 235, 0.1)', 
                  color: '#60a5fa', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.25rem' 
                }}>
                  AWS
                </span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(37, 99, 235, 0.1)', 
                  color: '#60a5fa', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.25rem' 
                }}>
                  Node.js
                </span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(37, 99, 235, 0.1)', 
                  color: '#60a5fa', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.25rem' 
                }}>
                  React
                </span>
              </div>
              <button className="btn-primary" style={{ width: '100%' }}>
                <ExternalLink style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                Live Demo
              </button>
            </div>

            {/* Featured Research */}
            <div className="card card-hover">
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Featured: Bug Detection Research
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Hybrid transformer + GNN pipeline for automated bug detection
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.25rem' 
                }}>
                  PyTorch
                </span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.25rem' 
                }}>
                  GNN
                </span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10b981', 
                  fontSize: '0.75rem', 
                  borderRadius: '0.25rem' 
                }}>
                  CodeBERT
                </span>
              </div>
              <button className="btn-secondary" style={{ width: '100%' }}>
                <ExternalLink style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                Read Paper ↗
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}