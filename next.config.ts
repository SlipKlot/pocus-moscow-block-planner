import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryBasePath = "/pocus-moscow-block-planner";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: repositoryBasePath,
        assetPrefix: repositoryBasePath,
        trailingSlash: true,
        images: { unoptimized: true },
        // The static demo does not import the Cloudflare-only database layer.
        // Its ambient `cloudflare:workers` types are unavailable to plain Next.js.
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;
