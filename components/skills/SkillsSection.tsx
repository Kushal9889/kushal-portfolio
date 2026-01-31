"use client";

import { motion } from "framer-motion";
import { skills, skillCategories } from "@/data/skills";

export function SkillsSection() {
  const featuredCategories = skillCategories.filter(cat => cat.featured);

  return (
    <section id="skills" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Technical <span className="gradient-text">Skills</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
            A comprehensive toolkit spanning cloud infrastructure, AI/ML, and full-stack development
          </p>
        </motion.div>

        {/* Featured Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {featuredCategories.map((category, index) => {
            const categorySkills = skills.filter(skill => 
              skill.category.includes(category.id)
            );
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(37, 99, 235, 0.1)' }}>
                    <category.icon style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600' }}>{category.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{category.description}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {categorySkills.slice(0, 3).map((skill) => (
                    <div key={skill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem' }}>{skill.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '4rem', height: '0.5rem', background: '#374151', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: 'linear-gradient(to right, #60a5fa, #a78bfa)', 
                              borderRadius: '9999px',
                              width: `${skill.proficiency}%`
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', width: '2rem' }}>
                          {skill.proficiency}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* All Skills Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="card"
              style={{ textAlign: 'center', padding: '1rem' }}
            >
              <h4 style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{skill.name}</h4>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize', marginBottom: '0.75rem' }}>
                {skill.proficiencyLevel}
              </p>
              
              <div style={{ width: '100%', height: '0.5rem', background: '#374151', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.proficiency}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{ height: '100%', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', borderRadius: '9999px' }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {skill.yearsOfExperience}+ years
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}