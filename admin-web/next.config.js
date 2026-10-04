require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  console.error('[admin-web] NEXT_PUBLIC_API_URL is not set in environment');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl || '',
  },
  async rewrites() {
    if (!apiUrl) return [];
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
