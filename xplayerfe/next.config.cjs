/** @type {import('next').NextConfig} */

// In dev the frontend runs on :3000 and the ASP.NET backend often runs on a
// different origin (and sometimes HTTPS). Images served from /wwwroot/uploads
// are not CORS-friendly and may be blocked by mixed-content.
//
// Solution: proxy /uploads/* through Next so the browser always uses the same
// origin. Hub code should render media URLs as "/uploads/...".

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
};

module.exports = nextConfig;
