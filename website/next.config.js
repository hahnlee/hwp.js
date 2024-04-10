/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hwp.js/parser', '@hwp.js/viewer'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.js', '.ts'],
    }
    return config
  },
}

module.exports = nextConfig
