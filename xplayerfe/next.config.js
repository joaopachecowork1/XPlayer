/** @type {import('next').NextConfig} */

const backend =
  process.env.XPLAYER_API_URL ||
  process.env.NEXT_PUBLIC_XPLAYER_API_URL ||
  "http://localhost:5000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backend}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;