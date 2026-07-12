/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // No remote image domains are known ahead of time (scans point at
    // arbitrary user-supplied URLs), so remote optimization is left off.
    unoptimized: true,
  },
}

export default nextConfig
