require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
    const baseUrl = apiUrl.replace(/\/v1$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
