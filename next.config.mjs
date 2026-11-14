/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = '/production-management-system';

const nextConfig = {
  reactStrictMode: true,
  output: isGithubActions ? 'export' : undefined,
  basePath: isGithubActions ? repo : '',
  assetPrefix: isGithubActions ? repo : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
