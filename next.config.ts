import type { NextConfig } from "next";

const config: NextConfig = {
  // The agent route needs a server runtime, so this is not a static export.
  // That is also why GitHub Pages cannot host this app.
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    },
  ],
};

export default config;
