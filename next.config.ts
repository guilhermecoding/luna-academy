import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";
import packageJson from "./package.json";

const remotePatterns: RemotePattern[] = [];

if (process.env.NEXT_PUBLIC_LOGO_CORPORATION) {
    const url = new URL(process.env.NEXT_PUBLIC_LOGO_CORPORATION);

    remotePatterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/**",
    });
}

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? packageJson.version,
    },
    reactCompiler: true,
    cacheComponents: true,
    allowedDevOrigins: process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
        ? process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS.split(",").map(o => o.trim())
        : [],
    images: {
        remotePatterns,
    },
    serverExternalPackages: ["@react-pdf/renderer"],
    ...(process.env.NEXT_PUBLIC_BUILD_MODE === "production" && {
        output: "standalone",
    }),
    poweredByHeader: false,
};



export default withSerwist(nextConfig);
