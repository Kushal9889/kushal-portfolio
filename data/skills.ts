export type ProficiencyLevel = "expert" | "advanced" | "intermediate" | "familiar";

export interface Skill {
  id: string;
  name: string;
  icon?: string; // We'll use lucide icons for now, but image paths later
  category: string[];
  proficiency: number; // 0-100
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience: number;
  usageContext: "production" | "projects" | "learning";
  subSkills: string[];
  usedIn: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: any; // Lucide icon
  color: string; // Tailwind class prefix
  description: string;
  featured?: boolean;
}

// CATEGORY DEFINITIONS
import { Cloud, Brain, Zap, Server, GitBranch, Code } from "lucide-react";

export const skillCategories: SkillCategory[] = [
  { id: "cloud", name: "Cloud Platforms", icon: Cloud, color: "blue", description: "Production Infrastructure", featured: true },
  { id: "ai-ml", name: "AI/ML Frameworks", icon: Brain, color: "purple", description: "Model Training & Inference", featured: true },
  { id: "ai-native", name: "AI-Native Tools", icon: Zap, color: "cyan", description: "10x Developer Workflow", featured: true },
  { id: "backend", name: "Backend & APIs", icon: Server, color: "emerald", description: "Scalable Microservices" },
  { id: "devops", name: "DevOps & IaC", icon: GitBranch, color: "orange", description: "CI/CD & Automation" },
  { id: "languages", name: "Languages", icon: Code, color: "pink", description: "Polyglot Engineering" },
];

export const skills: Skill[] = [
  // CLOUD
  {
    id: "aws",
    name: "AWS",
    category: ["cloud"],
    proficiency: 90,
    proficiencyLevel: "expert",
    yearsOfExperience: 2,
    usageContext: "production",
    subSkills: ["Lambda", "DynamoDB", "S3", "CloudFormation", "EC2", "IAM"],
    usedIn: ["IMG Systems (Prod)", "SolarBuddy"]
  },
  {
    id: "gcp",
    name: "Google Cloud",
    category: ["cloud"],
    proficiency: 75,
    proficiencyLevel: "advanced",
    yearsOfExperience: 1,
    usageContext: "production",
    subSkills: ["Cloud Run", "BigQuery", "Vertex AI", "GKE"],
    usedIn: ["Growaza (Prod)"]
  },

  // AI/ML
  {
    id: "pytorch",
    name: "PyTorch",
    category: ["ai-ml"],
    proficiency: 85,
    proficiencyLevel: "expert",
    yearsOfExperience: 2,
    usageContext: "production",
    subSkills: ["Transformers", "Custom Layers", "TorchServe", "Distributed Training"],
    usedIn: ["Bug Detection Research", "Custom Models"]
  },
  {
    id: "langchain",
    name: "LangChain",
    category: ["ai-ml", "ai-native"],
    proficiency: 80,
    proficiencyLevel: "advanced",
    yearsOfExperience: 1,
    usageContext: "projects",
    subSkills: ["Agents", "Vector Stores", "RAG Pipelines", "Tool Calling"],
    usedIn: ["AI Legal Assistant", "Chatbots"]
  },

  // AI-NATIVE TOOLS (THE DIFFERENTIATOR)
  {
    id: "cursor",
    name: "Cursor AI",
    category: ["ai-native"],
    proficiency: 95,
    proficiencyLevel: "expert",
    yearsOfExperience: 1,
    usageContext: "production",
    subSkills: ["Codebase Indexing", "Composer Mode", "Refactoring Agents"],
    usedIn: ["Daily Workflow"]
  },
  {
    id: "claude-api",
    name: "Claude API",
    category: ["ai-native", "backend"],
    proficiency: 85,
    proficiencyLevel: "expert",
    yearsOfExperience: 0.5,
    usageContext: "production",
    subSkills: ["Prompt Engineering", "Function Calling", "Context Window Opt."],
    usedIn: ["Growaza Feature"]
  },

  // BACKEND
  {
    id: "python",
    name: "Python",
    category: ["backend", "languages", "ai-ml"],
    proficiency: 95,
    proficiencyLevel: "expert",
    yearsOfExperience: 4,
    usageContext: "production",
    subSkills: ["FastAPI", "AsyncIO", "Pandas", "PyTest"],
    usedIn: ["All Projects"]
  },
  {
    id: "node",
    name: "Node.js",
    category: ["backend", "languages"],
    proficiency: 80,
    proficiencyLevel: "advanced",
    yearsOfExperience: 2,
    usageContext: "production",
    subSkills: ["Express", "Event Loop", "Streams", "Worker Threads"],
    usedIn: ["SolarBuddy", "TicketFY"]
  },

  // DEVOPS
  {
    id: "docker",
    name: "Docker",
    category: ["devops"],
    proficiency: 85,
    proficiencyLevel: "expert",
    yearsOfExperience: 2,
    usageContext: "production",
    subSkills: ["Multi-stage Builds", "Compose", "Networking", "Optimization"],
    usedIn: ["IMG Systems", "Deployments"]
  },
  {
    id: "terraform",
    name: "Terraform",
    category: ["devops", "cloud"],
    proficiency: 70,
    proficiencyLevel: "advanced",
    yearsOfExperience: 1,
    usageContext: "projects",
    subSkills: ["Modules", "State Management", "AWS Provider"],
    usedIn: ["Infrastructure as Code"]
  }
];