import { Github, Linkedin, Mail } from "lucide-react";

export const RESUME_DATA = {
  name: "Kushal Gaddamwar",
  initials: "KG",
  location: "Boston, MA",
  locationLink: "https://www.google.com/maps/place/Boston,+MA",
  
  // ELITE STRATEGY: Cycling Titles
  titles: [
    "Cloud & AI Architect",
    "Distributed Systems Engineer",
    "Full-Stack Strategist"
  ],
  
  summary: "MSCS at Boston University. 10x Engineer focused on scalable Cloud Infrastructure and Agentic AI. Formerly optimizing recruitment workflows at IMG Systems. Ranked Top 1% in National Engineering Entrance (JEE).",

  avatarUrl: "/me.jpg", // Add a photo named 'me.jpg' to your /public folder later
  
  contact: {
    email: "kushal7887pd@gmail.com",
    tel: "+18573284611",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/your-username",
        icon: Github,
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/your-username",
        icon: Linkedin,
      },
      {
        name: "Email",
        url: "mailto:kushal7887pd@gmail.com",
        icon: Mail,
      }
    ],
  },
} as const;
