/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  eslint: {
    // Disable Next.js's ESLint integration during builds since we're using ESLint 9 flat config
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
