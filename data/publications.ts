import { BookOpen, Code, Share2, Layers, Cpu, Network } from "lucide-react";

export interface Publication {
  id: string;
  title: string;
  conference: string;
  date: string;
  role: string;
  impact: string; // The "One-Liner" Hook
  tags: string[];
  techStack: string[];
  links: {
    paper: string;
    code?: string;
  };
  contributions: string[]; // Visible always
  methodology: {           // Visible on expand
    problem: string;
    approach: string;
    result: string;
  };
}

export const publications: Publication[] = [
  {
    id: "bug-detection",
    title: "Deep Learning for Contextual Bug Detection & Automated Fixes",
    conference: "IEEE ICAICCIT 2024",
    date: "June 2024",
    role: "First Author",
    impact: "Reduced debugging time by ~40% (simulated) using hybrid transformer pipelines.",
    tags: ["AI/ML", "Software Engineering", "NLP"],
    techStack: ["PyTorch", "HuggingFace", "CodeBERT", "AST Analysis"],
    links: {
      paper: "https://ieeexplore.ieee.org/document/your-link", // UPDATE THIS
      code: "https://github.com/your-repo",
    },
    contributions: [
      "Built context-aware classifier achieving 15% higher precision than baseline.",
      "Designed semantic search engine using CodeBERT embeddings.",
      "Integrated runtime trace mining for latent bug discovery."
    ],
    methodology: {
      problem: "Traditional static analysis lacks context, leading to high false positives in complex distributed systems.",
      approach: "We implemented a Graph Neural Network (GNN) combined with Transformer attention heads to analyze both Abstract Syntax Trees (AST) and developer commit history simultaneously.",
      result: "The model achieved a Top-10 Accuracy of 85% on the defects4j dataset, outperforming state-of-the-art heuristic methods."
    }
  },
  {
    id: "cps-systems",
    title: "Cyber-Physical Systems: Security & Optimization Strategies",
    conference: "IGI Global 2024",
    date: "March 2024",
    role: "Co-Author",
    impact: "Designed edge-computing frameworks for resilient smart city infrastructure.",
    tags: ["IoT", "Edge Computing", "Security"],
    techStack: ["Digital Twins", "Bayesian Networks", "Multi-Agent Systems"],
    links: {
      paper: "https://igi-global.com/chapter/your-link", // UPDATE THIS
    },
    contributions: [
      "Modeled CPS workflows using Digital Twins for pre-deployment simulation.",
      "Applied Bayesian networks for uncertainty modeling in urban decision making.",
      "Proposed decentralized traffic coordination reducing latency by 50ms."
    ],
    methodology: {
      problem: "Centralized cloud processing for Smart Cities introduces unacceptable latency and single points of failure.",
      approach: "We proposed a hierarchical Edge Computing architecture where local sensor clusters process data using lightweight Multi-Agent Systems, syncing only critical state changes to the cloud.",
      result: "Simulation proved a 40% reduction in network bandwidth usage and a 99.9% uptime resilience against localized node failures."
    }
  }
];