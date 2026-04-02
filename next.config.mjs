/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wqnmyfkavrotpmupbtou.supabase.co',
      },
    ],
  },
};

export default nextConfig;
