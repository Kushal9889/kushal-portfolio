"use client";

import { useState, useEffect } from "react";
import { Menu, X, Download, Target } from "lucide-react";

const navigation = [
  { name: "Home", href: "#home" },
  { name: "Experience", href: "#experience" },
  { name: "Research", href: "#research" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

const roleTargets = [
  { id: "cloud-architect", label: "Cloud Architect", color: "#60a5fa" },
  { id: "ai-engineer", label: "AI Engineer", color: "#10b981" },
  { id: "sde", label: "Software Engineer", color: "#a78bfa" }
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState("cloud-architect");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Role targeting from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role && roleTargets.find(r => r.id === role)) {
      setActiveRole(role);
    }
  }, []);

  const currentRoleColor = roleTargets.find(r => r.id === activeRole)?.color || "#60a5fa";

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: scrolled ? 'rgba(17, 24, 39, 0.95)' : 'rgba(17, 24, 39, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid #374151' : '1px solid transparent',
      transition: 'all 0.3s ease'
    }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
          
          {/* Logo with Role Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="#home" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  background: '#CC0000', 
                  borderRadius: '2px' 
                }} />
                <span className="gradient-text" style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  KG
                </span>
              </div>
            </a>
            
            {/* Role Targeting Dropdown */}
            <div style={{ position: 'relative', display: 'none' }} className="desktop-nav">
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: `${currentRoleColor}20`,
                  border: `1px solid ${currentRoleColor}40`,
                  borderRadius: '0.5rem',
                  color: currentRoleColor,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Target style={{ width: '12px', height: '12px' }} />
                {roleTargets.find(r => r.id === activeRole)?.label}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                style={{ 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.3s ease',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                {item.name}
              </a>
            ))}
            
            <button 
              className="btn-primary" 
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              <Download style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
              Resume
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'block',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div style={{ 
            borderTop: '1px solid #374151', 
            padding: '1rem 0',
            background: 'rgba(17, 24, 39, 0.98)'
          }}>
            {/* Role Selector Mobile */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Viewing as:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {roleTargets.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: activeRole === role.id ? `${role.color}20` : 'transparent',
                      border: `1px solid ${activeRole === role.id ? role.color + '40' : '#374151'}`,
                      borderRadius: '9999px',
                      color: activeRole === role.id ? role.color : '#9ca3af',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  color: '#9ca3af',
                  textDecoration: 'none',
                  padding: '0.75rem 0',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderBottom: '1px solid #374151',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                {item.name}
              </a>
            ))}
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
            >
              <Download style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
              Download Resume
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}