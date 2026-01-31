import { TrendingUp, Zap, GitBranch, Database, Clock, Users } from "lucide-react";

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: "Internship" | "Full-time";
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  metrics: {
    icon: any; // Lucide icon
    value: string;
    label: string;
  }[];
  techStack: string[];
  achievements: string[];
  description: string;
}

export const experiences: Experience[] = [
  {
    id: "img-systems",
    company: "IMG Systems",
    role: "Software Development Engineer Intern",
    type: "Internship",
    startDate: "Aug 2024",
    endDate: "Apr 2025",
    duration: "8 months",
    location: "Remote",
    metrics: [
      {
        icon: TrendingUp,
        value: "20%",
        label: "Parsing Accuracy ↑",
      },
      {
        icon: Clock,
        value: "70%",
        label: "Review Time ↓",
      },
      {
        icon: Zap,
        value: "25%",
        label: "Latency Reduction",
      },
    ],
    techStack: [
      "AWS Lambda",
      "Docker",
      "Kubernetes",
      "Python",
      "PostgreSQL",
      "GitHub Actions",
      "Apache Tika",
    ],
    achievements: [
      "Architected an Apache Tika-based resume parsing engine processing 5,000+ profiles monthly.",
      "Built automated screening pipelines achieving 95% validation accuracy.",
      "Designed Dockerized microservices and optimized database queries for high-throughput capability.",
    ],
    description: "Led the architectural overhaul of the recruitment automation platform, focusing on scalable microservices and intelligent data parsing.",
  },
  {
    id: "growaza",
    company: "Growaza Pvt. Ltd.",
    role: "Associate SDE Intern",
    type: "Internship",
    startDate: "Jan 2024",
    endDate: "Jul 2024",
    duration: "7 months",
    location: "Remote",
    metrics: [
      {
        icon: Zap,
        value: "30%",
        label: "Response Speed ↑",
      },
      {
        icon: Database,
        value: "2K+",
        label: "SKUs Managed",
      },
      {
        icon: Users,
        value: "1K+",
        label: "Daily Active Users",
      },
    ],
    techStack: [
      "React",
      "Redis",
      "MySQL",
      "D3.js",
      "AWS (EC2)",
      "Node.js",
    ],
    achievements: [
      "Implemented a Redis caching layer to handle high-concurrency traffic spikes.",
      "Engineered a real-time D3.js analytics dashboard with 98% data accuracy.",
      "Secured REST APIs using JWT authentication and Role-Based Access Control (RBAC).",
    ],
    description: "Full-stack optimization for a high-traffic SaaS platform, focusing on frontend performance and secure backend architecture.",
  },
];