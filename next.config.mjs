
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración adicional para desarrollo
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Mejorar tiempo de compilación
  swcMinify: true,
}

export default nextConfig
