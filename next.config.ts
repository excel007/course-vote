import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16.2 — Turbopack is default, no extra config needed
  logging: {
    browserToTerminal: true, // forward browser errors to terminal (16.2 feature)
  },
}

export default nextConfig
