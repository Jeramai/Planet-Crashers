/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/Planet-Crashers" : undefined,
  reactStrictMode: true,
};

module.exports = nextConfig
