/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "dist",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amaranth-nearby-leech-573.mypinata.cloud",
        port: "",
        // pathname: "/account123/**",
      },
    ], // Add the Cloudinary domain here
  },
};

export default nextConfig;
