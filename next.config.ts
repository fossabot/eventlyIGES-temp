import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <-- aggiungi questa riga
  images: {
    domains: [
      "fkupqytygedxmcwtfmub.supabase.co",
      "www.djmagitalia.com",
      "www.apemusicale.it",
      "s.myguestcare.com"
    ],
  },
  async headers() {
    return [
      {
        source: '/images/:all*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:all*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};
