/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "../../",   // ← path to your monorepo root
  },
};

module.exports = nextConfig;
