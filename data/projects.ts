import { Zap, BarChart, Activity, Users, Layers, Cloud } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  featured?: boolean;
  preview: {
    type: "video" | "gif" | "image";
    url: string; // Add your file to /public/projects/
    thumbnail: string;
  };
  metrics: {
    icon: any;
    value: string;
    label: string;
  }[];
  links: {
    github?: string;
    demo?: string;
  };
  techStack: string[];
  expanded: {
    architecture: string[];
    challenge: string;
  };
}

export const projects: Project[] = [
  {
    id: "solar-buddy",
    title: "Distributed Energy Marketplace",
    tagline: "SaaS platform connecting homeowners with solar installers via Stripe Connect.",
    featured: true,
    preview: {
      type: "image", // Change to 'video' when you have one
      url: "/projects/solar-preview.jpg", // Create this file
      thumbnail: "/projects/solar-thumb.jpg",
    },
    metrics: [
      { icon: Users, value: "90%", label: "User Satisfaction" },
      { icon: Activity, value: "3-Tier", label: "Subscription Model" },
      { icon: Zap, value: "$50K+", label: "Processed Volume" },
    ],
    links: {
      github: "https://github.com/yourusername/solar",
      demo: "https://solarbuddy.demo",
    },
    techStack: ["Node.js", "MongoDB", "AWS", "Stripe Connect", "React"],
    expanded: {
      architecture: [
        "Implemented multi-tenant architecture with isolated data schemas for security.",
        "Integrated Stripe Connect for complex split-payments between platform and installers.",
        "Deployed on AWS Elastic Beanstalk with auto-scaling rules."
      ],
      challenge: "Handling real-time payment verification while maintaining zero-downtime for concurrent users. Solved using webhooks and an event-driven queue system."
    }
  },
  {
    id: "ticket-fy",
    title: "High-Frequency Data Aggregator",
    tagline: "Low-latency movie data engine with aggressive caching strategies.",
    featured: false,
    preview: {
      type: "image",
      url: "/projects/ticket-preview.jpg",
      thumbnail: "/projects/ticket-thumb.jpg",
    },
    metrics: [
      { icon: Zap, value: "<50ms", label: "Data Retrieval" },
      { icon: Cloud, value: "40%", label: "Cache Hit Rate" },
    ],
    links: {
      github: "https://github.com/yourusername/ticketfy",
    },
    techStack: ["React", "Redis (Simulated)", "TMDB API", "CSS3"],
    expanded: {
      architecture: [
        "Implemented client-side caching with SWR to minimize API calls.",
        "Optimized rendering using React.memo and virtualization for large lists.",
      ],
      challenge: "Synchronizing state across multiple components without prop drilling. Solved using a custom Context API wrapper optimized for performance."
    }
  },
  {
    id: "algo-viz",
    title: "Real-Time Algorithmic Engine",
    tagline: "Interactive visualization tool for complex sorting algorithms.",
    featured: false,
    preview: {
      type: "image",
      url: "/projects/algo-preview.jpg",
      thumbnail: "/projects/algo-thumb.jpg",
    },
    metrics: [
      { icon: Users, value: "200+", label: "Student Users" },
      { icon: Zap, value: "60FPS", label: "Rendering Speed" },
    ],
    links: {
      github: "https://github.com/yourusername/sorting",
    },
    techStack: ["React", "WebSockets", "D3.js"],
    expanded: {
      architecture: [
        "Used WebSockets for real-time state updates during algorithm execution.",
        "Decoupled the rendering engine from the logic engine to prevent UI freezing.",
      ],
      challenge: "Visualizing O(n^2) algorithms on large datasets caused main-thread blocking. Solved by moving calculation logic to a Web Worker."
    }
  }
  // Add more projects here
];