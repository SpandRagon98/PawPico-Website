import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isHostingerBuild = process.env.HOSTINGER_BUILD === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "PawPico-Website";
const pagesBasePath =
  isHostingerBuild
    ? ""
    : process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : `/${repositoryName}`;

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        ...(pagesBasePath
          ? {
              basePath: pagesBasePath,
              assetPrefix: pagesBasePath,
            }
          : {}),
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
