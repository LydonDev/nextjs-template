import path from 'path'
import { fileURLToPath } from 'url'
import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  devIndicators: false,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['lodash', 'date-fns', 'react-icons', '@heroicons/react', 'lucide-react', 'clsx', 'tailwind-merge'],
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeServerReact: true,
    gzipSize: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['data-testid'] } : false,
  },
  webpack: (config: Configuration, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...config.resolve.alias, '@': './src' }

    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      }

      config.optimization = config.optimization || {}
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all',
          },
        },
      }

      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    return config
  },
}

if (process.env.ANALYZE === 'true') {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  nextConfig.webpack = (config: Configuration) => {
    config.plugins = config.plugins || []
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }))
    return config
  }
}

export default nextConfig
