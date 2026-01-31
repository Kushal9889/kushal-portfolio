export interface Certification {
    id: string;
    name: string;
    issuer: string;
    logo: string;
    verifyUrl: string;
    date: string;
  }
  
  export const certifications: Certification[] = [
    {
      id: "aws-saa",
      name: "Solutions Architect Assoc.",
      issuer: "AWS",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
      verifyUrl: "https://www.credly.com",
      date: "2024"
    },
    {
      id: "gcp-pca",
      name: "Professional Cloud Arch.",
      issuer: "Google Cloud",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
      verifyUrl: "https://google.com",
      date: "2024"
    },
    {
      id: "azure-funds",
      name: "Azure Fundamentals",
      issuer: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Microsoft_Azure_Logo.svg",
      verifyUrl: "https://microsoft.com",
      date: "2023"
    },
    {
      id: "ml-spec",
      name: "Machine Learning Spec.",
      issuer: "DeepLearning.AI",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/Coursera-Logo_600x600.svg",
      verifyUrl: "https://coursera.org",
      date: "2023"
    }
  ];