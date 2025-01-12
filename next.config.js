/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add asset prefix for static files if needed
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://your-cdn.com' : '',
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Specific headers for video files
        source: '/:path*.mp4',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
        ],
      },
    ];
  },

  // Enable webpack configuration if needed
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos/',
          outputPath: 'static/videos/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },
}