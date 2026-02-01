"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Github, Linkedin, Star, ExternalLink, FileText, Briefcase, Code, Award, User, Cloud, Cpu, Database, Palette, Users, Zap } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
import { CertificationCard } from "../components/CertificationCard";
import { SkillCard } from "../components/SkillCard";
import { PersonalNote } from "../components/PersonalNote";

const sections = [
  { id: "projects", name: "Projects", icon: "🚀", color: "#a78bfa" },
  { id: "skills", name: "Skills", icon: "⚡", color: "#f59e0b" },
  { id: "certifications", name: "Certifications", icon: "🏆", color: "#ef4444" },
  { id: "experience", name: "Experience", icon: "💼", color: "#60a5fa" },
  { id: "research", name: "Research", icon: "🧠", color: "#10b981" }
];

// Enhanced skills data organized by categories
const skillsData = [
  {
    category: "Cloud Platforms",
    icon: Cloud,
    color: "#60a5fa",
    skills: [
      { name: "AWS", theoretical: 90, practical: 85, years: "2+", description: "EC2, S3, Lambda, RDS, VPC, CloudFormation" },
      { name: "Google Cloud Platform", theoretical: 80, practical: 70, years: "1+", description: "Compute Engine, Cloud Functions, BigQuery" },
      { name: "Microsoft Azure", theoretical: 70, practical: 60, years: "1", description: "App Service, Azure Functions, Cosmos DB" },
      { name: "Docker", theoretical: 85, practical: 85, years: "2+", description: "Containerization, Multi-stage builds, Orchestration" },
      { name: "Kubernetes", theoretical: 75, practical: 65, years: "1+", description: "Pod management, Services, Ingress, Helm" },
      { name: "Terraform", theoretical: 80, practical: 80, years: "1+", description: "Infrastructure as Code, Multi-cloud deployments" }
    ]
  },
  {
    category: "Programming Languages",
    icon: Code,
    color: "#10b981",
    skills: [
      { name: "Python", theoretical: 95, practical: 95, years: "4+", description: "Django, FastAPI, Data Science, ML/AI" },
      { name: "JavaScript", theoretical: 85, practical: 85, years: "3+", description: "ES6+, Node.js, React, Vue.js" },
      { name: "TypeScript", theoretical: 80, practical: 80, years: "2+", description: "Type safety, Advanced types, Decorators" },
      { name: "Go", theoretical: 75, practical: 65, years: "1+", description: "Concurrency, Microservices, CLI tools" },
      { name: "Java", theoretical: 80, practical: 70, years: "2+", description: "Spring Boot, Maven, Enterprise applications" },
      { name: "C++", theoretical: 70, practical: 60, years: "2+", description: "System programming, Performance optimization" }
    ]
  },
  {
    category: "AI/ML & Data",
    icon: Cpu,
    color: "#a78bfa",
    skills: [
      { name: "PyTorch", theoretical: 85, practical: 85, years: "2+", description: "Neural networks, Computer vision, NLP" },
      { name: "TensorFlow", theoretical: 80, practical: 70, years: "1+", description: "Deep learning, Model deployment, TensorBoard" },
      { name: "Scikit-learn", theoretical: 85, practical: 80, years: "2+", description: "Classical ML, Feature engineering, Pipelines" },
      { name: "Pandas", theoretical: 90, practical: 90, years: "3+", description: "Data manipulation, Analysis, ETL processes" },
      { name: "NumPy", theoretical: 85, practical: 85, years: "3+", description: "Numerical computing, Array operations" },
      { name: "Hugging Face", theoretical: 80, practical: 75, years: "1+", description: "Transformers, Model fine-tuning, Datasets" }
    ]
  },
  {
    category: "AI Native Tools",
    icon: Zap,
    color: "#06b6d4",
    skills: [
      { name: "Amazon Q", theoretical: 85, practical: 80, years: "1+", description: "AI-powered coding assistant, Code generation" },
      { name: "Cursor", theoretical: 90, practical: 85, years: "1+", description: "AI-first code editor, Intelligent completions" },
      { name: "GitHub Copilot", theoretical: 85, practical: 85, years: "1+", description: "AI pair programming, Code suggestions" },
      { name: "n8n", theoretical: 75, practical: 70, years: "6m", description: "Workflow automation, API integrations" },
      { name: "Zapier", theoretical: 80, practical: 75, years: "1+", description: "No-code automation, App connections" },
      { name: "ChatGPT API", theoretical: 85, practical: 80, years: "1+", description: "LLM integration, Conversational AI" },
      { name: "Claude API", theoretical: 80, practical: 75, years: "6m", description: "Advanced reasoning, Code analysis" },
      { name: "Midjourney", theoretical: 70, practical: 65, years: "6m", description: "AI image generation, Creative workflows" }
    ]
  },
  {
    category: "Databases & Storage",
    icon: Database,
    color: "#f59e0b",
    skills: [
      { name: "PostgreSQL", theoretical: 85, practical: 85, years: "2+", description: "Advanced queries, Indexing, Performance tuning" },
      { name: "MongoDB", theoretical: 80, practical: 75, years: "1+", description: "Document design, Aggregation, Sharding" },
      { name: "Redis", theoretical: 80, practical: 80, years: "1+", description: "Caching, Pub/Sub, Data structures" },
      { name: "Elasticsearch", theoretical: 75, practical: 65, years: "1+", description: "Search, Analytics, Log aggregation" },
      { name: "DynamoDB", theoretical: 70, practical: 60, years: "1", description: "NoSQL design, Scaling, Cost optimization" }
    ]
  },
  {
    category: "Frontend & Design",
    icon: Palette,
    color: "#ef4444",
    skills: [
      { name: "React", theoretical: 90, practical: 90, years: "3+", description: "Hooks, Context, Performance optimization" },
      { name: "Next.js", theoretical: 85, practical: 80, years: "2+", description: "SSR, SSG, API routes, Performance" },
      { name: "Vue.js", theoretical: 75, practical: 65, years: "1+", description: "Composition API, Vuex, Component design" },
      { name: "Tailwind CSS", theoretical: 85, practical: 85, years: "2+", description: "Utility-first, Responsive design, Custom themes" },
      { name: "D3.js", theoretical: 80, practical: 70, years: "1+", description: "Data visualization, Interactive charts" },
      { name: "Figma", theoretical: 65, practical: 60, years: "1", description: "UI/UX design, Prototyping, Design systems" }
    ]
  },
  {
    category: "Soft Skills & Leadership",
    icon: Users,
    color: "#8b5cf6",
    skills: [
      { name: "Technical Leadership", theoretical: 80, practical: 80, years: "2+", description: "Team mentoring, Architecture decisions" },
      { name: "Project Management", theoretical: 75, practical: 75, years: "2+", description: "Agile, Scrum, Timeline management" },
      { name: "Communication", theoretical: 85, practical: 85, years: "4+", description: "Technical writing, Presentations, Stakeholder management" },
      { name: "Problem Solving", theoretical: 90, practical: 90, years: "4+", description: "Analytical thinking, Debugging, System design" },
      { name: "Mentoring", theoretical: 75, practical: 75, years: "1+", description: "Code reviews, Knowledge sharing, Team growth" }
    ]
  }
];
const certificationsData = [
  {
    name: "AWS Solutions Architect Associate",
    organization: "Amazon Web Services",
    organizationLogo: "/certifications/aws-logo.png",
    color: "#FF9900",
    status: "Active",
    issueDate: "March 2024",
    description: "Comprehensive certification covering AWS cloud architecture, security, and best practices. Gained expertise in designing scalable, highly available, and fault-tolerant systems on AWS.",
    keyLearnings: [
      "Designed and deployed scalable applications on AWS cloud infrastructure",
      "Implemented security best practices and compliance frameworks",
      "Optimized costs through proper resource selection and management",
      "Architected fault-tolerant systems with disaster recovery strategies",
      "Mastered AWS services including EC2, S3, RDS, Lambda, and VPC"
    ],
    skillsGained: ["AWS Architecture", "Cloud Security", "Cost Optimization", "Auto Scaling", "Load Balancing", "VPC Design", "IAM Policies", "CloudFormation"],
    verificationUrl: "https://aws.amazon.com/verification/your-cert-id"
  },
  {
    name: "Google Cloud Professional Cloud Architect",
    organization: "Google Cloud",
    organizationLogo: "/certifications/gcp-logo.png",
    color: "#4285F4",
    status: "In Progress",
    issueDate: "Expected Dec 2024",
    description: "Advanced certification focusing on Google Cloud Platform architecture, design patterns, and enterprise-grade solutions. Currently preparing for the certification exam.",
    keyLearnings: [
      "Designing GCP solutions for business requirements",
      "Managing and provisioning cloud solution infrastructure",
      "Designing for security and compliance in GCP",
      "Analyzing and optimizing technical and business processes",
      "Implementing GCP services for data processing and machine learning"
    ],
    skillsGained: ["GCP Architecture", "Kubernetes", "BigQuery", "Cloud Functions", "Pub/Sub", "Cloud Storage", "Networking"],
    verificationUrl: "https://cloud.google.com/certification/cloud-architect"
  },
  {
    name: "Azure Fundamentals AZ-900",
    organization: "Microsoft",
    organizationLogo: "/certifications/azure-logo.png",
    color: "#0078D4",
    status: "Active",
    issueDate: "January 2024",
    description: "Foundational certification covering Microsoft Azure cloud concepts, core services, security, privacy, compliance, and pricing models.",
    keyLearnings: [
      "Understanding of cloud computing concepts and Azure services",
      "Knowledge of Azure security, privacy, and compliance features",
      "Familiarity with Azure pricing and support models",
      "Hands-on experience with Azure portal and basic services",
      "Understanding of Azure governance and management tools"
    ],
    skillsGained: ["Azure Basics", "Cloud Concepts", "Azure Security", "Resource Management", "Azure Pricing", "Compliance"],
    verificationUrl: "https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals"
  },
  {
    name: "Machine Learning Specialization",
    organization: "Coursera (Stanford)",
    organizationLogo: "/certifications/coursera-logo.png",
    color: "#0056D3",
    status: "Completed",
    issueDate: "September 2023",
    description: "Comprehensive specialization covering machine learning algorithms, neural networks, and practical implementation using Python and TensorFlow.",
    keyLearnings: [
      "Implemented supervised and unsupervised learning algorithms",
      "Built and trained neural networks using TensorFlow",
      "Applied machine learning to real-world problems and datasets",
      "Understanding of deep learning and advanced ML techniques",
      "Practical experience with feature engineering and model evaluation"
    ],
    skillsGained: ["Machine Learning", "Neural Networks", "TensorFlow", "Python", "Data Analysis", "Deep Learning", "Model Evaluation"],
    verificationUrl: "https://coursera.org/verify/specialization/your-cert-id"
  }
];
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

  // Auto-rotation every 3 seconds with smooth transitions
  useEffect(() => {
    if (!isUserSelected) {
      const interval = setInterval(() => {
        setActiveSection(prev => {
          const currentIndex = sections.findIndex(s => s.id === prev);
          const nextIndex = (currentIndex + 1) % sections.length;
          return sections[nextIndex].id;
        });
      }, 3000); // Increased to 3 seconds for smoother experience
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

      {/* ELITE TOP 0.01% STICKY NAVIGATION */}
      <div id="main-navigation" style={{ 
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.95), rgba(17, 24, 39, 0.98))', 
        backdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '2rem 0',
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Ambient Background Effects */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
            linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)
          `,
          animation: 'ambientFlow 15s ease-in-out infinite'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Elite Section Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              borderRadius: '2.5rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              width: '80%',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)'
            }}>
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className="elite-nav-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    background: isActive 
                      ? `linear-gradient(135deg, ${section.color}25, ${section.color}15)` 
                      : 'transparent',
                    border: 'none',
                    borderRadius: '1.25rem',
                    color: isActive ? section.color : '#cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    flex: '1',
                    justifyContent: 'center',
                    textAlign: 'center',
                    letterSpacing: '0.025em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {/* Hover Glow Effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${section.color}15, transparent)`,
                    opacity: isActive ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                  
                  {/* Icon */}
                  <div style={{
                    fontSize: '1.2rem',
                    filter: isActive ? `drop-shadow(0 0 8px ${section.color}60)` : 'none',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    {section.icon}
                  </div>
                  
                  {/* Section Name */}
                  <span style={{
                    textShadow: isActive 
                      ? `0 0 20px ${section.color}40, inset 0 1px 2px rgba(0, 0, 0, 0.3)` 
                      : 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    {section.name}
                  </span>
                  
                  {/* Active Progress Indicator */}
                  {!isUserSelected && isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${section.color}, transparent)`,
                      borderRadius: '1px',
                      animation: 'progressFlow 3s linear infinite',
                      width: '100%',
                      boxShadow: `0 0 12px ${section.color}60`
                    }} />
                  )}
                </button>
              );
            })}
            </div>
          </div>
          
          {/* Elite Control Panel */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '2rem'
          }}>
            {/* Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isUserSelected 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: isUserSelected 
                    ? '0 0 12px rgba(239, 68, 68, 0.6)' 
                    : '0 0 12px rgba(16, 185, 129, 0.6)',
                  animation: isUserSelected ? 'none' : 'pulse 2s infinite'
                }} />
                <span style={{
                  fontSize: '0.875rem',
                  color: '#e2e8f0',
                  fontWeight: '500',
                  letterSpacing: '0.025em'
                }}>
                  {isUserSelected ? 'Manual Control' : 'Auto Sequence'}
                </span>
              </div>
              
              <div style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                fontWeight: '500',
                padding: '0.25rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem'
              }}>
                {sections.findIndex(s => s.id === activeSection) + 1} / {sections.length}
              </div>
            </div>
            
            {/* Resume Auto Button */}
            {isUserSelected && (
              <button
                onClick={() => setIsUserSelected(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '1rem',
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  backdropFilter: 'blur(20px)',
                  letterSpacing: '0.025em'
                }}
              >
                Resume Auto
              </button>
            )}
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
      
      {/* Personal Note Component */}
      <PersonalNote section={activeSection} />
      
      {/* ELITE TOP 0.01% FOOTER */}
      <footer>
        {/* Floating Particles */}
        <div className="footer-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">KUSHAL GADDAMWAR</div>
            <p className="footer-tagline">
              Crafting the future of software engineering through innovative AI solutions and scalable cloud architectures.
            </p>
            <div className="social-constellation">
              <a href="https://github.com/yourusername" className="social-orb" target="_blank" rel="noopener noreferrer">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com/in/yourusername" className="social-orb" target="_blank" rel="noopener noreferrer">
                <Linkedin size={20} />
              </a>
              <a href="mailto:your.email@example.com" className="social-orb">
                <span style={{fontSize: '16px'}}>@</span>
              </a>
              <a href="/resume.pdf" className="social-orb" target="_blank">
                <Download size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <button 
              onClick={() => {
                setActiveSection('experience');
                setIsUserSelected(true);
                document.getElementById('main-navigation')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="footer-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Experience
            </button>
            <button 
              onClick={() => {
                setActiveSection('research');
                setIsUserSelected(true);
                document.getElementById('main-navigation')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="footer-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Research
            </button>
            <button 
              onClick={() => {
                setActiveSection('projects');
                setIsUserSelected(true);
                document.getElementById('main-navigation')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="footer-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Projects
            </button>
            <button 
              onClick={() => {
                setActiveSection('skills');
                setIsUserSelected(true);
                document.getElementById('main-navigation')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="footer-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Skills
            </button>
            <button 
              onClick={() => {
                setActiveSection('certifications');
                setIsUserSelected(true);
                document.getElementById('main-navigation')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="footer-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Certifications
            </button>
          </div>
          
          {/* Technologies */}
          <div className="footer-section">
            <h4 className="footer-section-title">Technologies</h4>
            <a href="#" className="footer-link">AWS Cloud</a>
            <a href="#" className="footer-link">Machine Learning</a>
            <a href="#" className="footer-link">React & Next.js</a>
            <a href="#" className="footer-link">Python & Node.js</a>
            <a href="#" className="footer-link">Docker & Kubernetes</a>
          </div>
          
          {/* Connect */}
          <div className="footer-section">
            <h4 className="footer-section-title">Connect</h4>
            <a href="mailto:your.email@example.com" className="footer-link">Email</a>
            <a href="https://linkedin.com/in/yourusername" className="footer-link" target="_blank">LinkedIn</a>
            <a href="https://github.com/yourusername" className="footer-link" target="_blank">GitHub</a>
            <a href="/resume.pdf" className="footer-link" target="_blank">Resume</a>
            <a href="#" className="footer-link">Portfolio</a>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <span>© 2024 Kushal Gaddamwar</span>
              <span>•</span>
              <span>Made with</span>
              <span className="footer-heart">♥</span>
              <span>in Boston</span>
            </div>
            <div className="footer-tech">
              <div className="tech-orb" title="Next.js">N</div>
              <div className="tech-orb" title="React">R</div>
              <div className="tech-orb" title="TypeScript">T</div>
              <div className="tech-orb" title="AWS">A</div>
              <div className="tech-orb" title="Python">P</div>
            </div>
          </div>
        </div>
      </footer>
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
                <h3 className="card-heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', position: 'relative' }}>
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
                <h3 className="card-heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', position: 'relative' }}>
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
                <h3 className="card-heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.3', position: 'relative' }}>
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
                <h3 className="card-heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.3', position: 'relative' }}>
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
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
          Technical <span className="gradient-text">Skills</span>
        </h2>
        
        {/* Global Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '3rem',
          padding: '1rem 2rem',
          background: 'rgba(31, 41, 55, 0.5)',
          borderRadius: '1rem',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '8px',
              background: 'linear-gradient(90deg, rgba(96, 165, 250, 0.4), rgba(96, 165, 250, 0.6))',
              borderRadius: '4px',
              border: '1px solid rgba(96, 165, 250, 0.3)'
            }} />
            <span style={{ color: '#d1d5db', fontSize: '0.9rem', fontWeight: '500' }}>Theoretical Knowledge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '8px',
              background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
              borderRadius: '4px',
              boxShadow: '0 0 8px rgba(96, 165, 250, 0.4)'
            }} />
            <span style={{ color: '#d1d5db', fontSize: '0.9rem', fontWeight: '500' }}>Practical Experience</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {skillsData.map((skillCategory, i) => (
            <SkillCard key={i} skillCategory={skillCategory} />
          ))}
        </div>
      </div>
    ),
    
    certifications: (
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
          <span className="gradient-text">Certifications</span> & Credentials
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {certificationsData.map((certification, i) => (
            <CertificationCard key={i} certification={certification} />
          ))}
        </div>
      </div>
    )
  };

  return content[sectionId] || <div>Section not found</div>;
}