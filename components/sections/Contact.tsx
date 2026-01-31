"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Calendar, ArrowRight } from "lucide-react";
import { RESUME_DATA } from "@/data/resume-data";

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Let's <span className="gradient-text">Connect</span>
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
              I'm always interested in discussing new opportunities, innovative projects, 
              and collaborations in cloud architecture and AI.
            </p>
          </div>

          {/* Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card card-hover"
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mail style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Email</h3>
              <a
                href={`mailto:${RESUME_DATA.contact.email}`}
                style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#60a5fa'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                {RESUME_DATA.contact.email}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card card-hover"
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Location</h3>
              <p style={{ color: '#9ca3af' }}>{RESUME_DATA.location}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="card card-hover"
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Availability</h3>
              <p style={{ color: '#9ca3af' }}>January 2026</p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ready to collaborate?</h3>
              <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
                Whether you're looking for a cloud architect, AI engineer, or full-stack developer, 
                I'd love to discuss how we can work together.
              </p>
              <a
                href={`mailto:${RESUME_DATA.contact.email}?subject=Let's discuss opportunities`}
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Get in touch
                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} />
              </a>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {RESUME_DATA.contact.social.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #4b5563',
                    background: 'rgba(31, 41, 55, 0.5)',
                    color: '#9ca3af',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <social.icon style={{ width: '20px', height: '20px' }} />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}