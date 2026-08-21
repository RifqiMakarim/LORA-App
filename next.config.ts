import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/toko/dashboard',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/toko/dashboard/pesanan',
        destination: '/dashboard/pesanan',
        permanent: false,
      },
      {
        source: '/toko/dashboard/pengaturan',
        destination: '/dashboard/pengaturan',
        permanent: false,
      },
      {
        source: '/inventory',
        destination: '/dashboard/inventory',
        permanent: false,
      },
      {
        source: '/forecast',
        destination: '/dashboard/forecast',
        permanent: false,
      },
      {
        source: '/ai-consultant',
        destination: '/dashboard/ai-consultant',
        permanent: false,
      },
      {
        source: '/events',
        destination: '/dashboard/events',
        permanent: false,
      },
      {
        source: '/customers',
        destination: '/dashboard/customers',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
