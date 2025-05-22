/** @type {import('next').NextConfig} */

// This file sets up the configuration for Next.js with Sentry integration
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Configure assetPrefix for Replit
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : undefined,
  // Make sure Next.js listens on 0.0.0.0 to be accessible outside the container
  env: {
    HOST: '0.0.0.0',
  },
  // Increase webpack timeout and configure chunk loading
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      poll: 1000,
      aggregateTimeout: 300,
    };

    // Increase chunk loading timeout
    config.output.chunkLoadTimeout = 60000; // 60 seconds

    return config;
  },
};

// Sentry webpack plugin configuration
const sentryWebpackPluginOptions = {
  // Additional options for the Sentry webpack plugin
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
};

// Export the Next.js configuration with Sentry integration
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);