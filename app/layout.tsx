import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kushal Gaddamwar | Cloud & AI Architect",
  description: "MSCS at Boston University. Cloud Solution Architect specializing in AWS, GCP, AI/ML systems, and full-stack development.",
  keywords: ["Cloud Architect", "AI Engineer", "Software Engineer", "AWS", "GCP", "Machine Learning"],
  authors: [{ name: "Kushal Gaddamwar" }],
  creator: "Kushal Gaddamwar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kushalgaddamwar.com",
    title: "Kushal Gaddamwar | Cloud & AI Architect",
    description: "Cloud Solution Architect specializing in AWS, GCP, AI/ML systems, and full-stack development.",
    siteName: "Kushal Gaddamwar Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kushal Gaddamwar | Cloud & AI Architect",
    description: "Cloud Solution Architect specializing in AWS, GCP, AI/ML systems, and full-stack development.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}