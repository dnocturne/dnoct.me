/**
 * GitHub REST API fetcher for OSS project stats.
 *
 * Auth: optional `GITHUB_TOKEN` env var (public repos only, read-only scope).
 */

import type { OssStats } from "./types";
import { emptyOssStats } from "./types";
import { withCache } from "./cache";

const FETCH_TIMEOUT_MS = 5000;

interface GitHubRepo {
  stargazers_count: number;
  description: string | null;
  language: string | null;
  html_url: string;
  default_branch: string;
}

interface GitHubReleaseAsset {
  download_count: number;
  browser_download_url: string;
  name: string;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: GitHubReleaseAsset[];
}

interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string };
  };
}

function buildHeaders(): HeadersInit {
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dnoct-me-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchGithubStatsLive(owner: string, repo: string): Promise<OssStats> {
  const headers = buildHeaders();
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);

  const [repoRes, releasesRes, commitsRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, signal }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, { headers, signal }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers, signal }),
  ]);

  if (!repoRes.ok) throw new Error(`GitHub /repos ${owner}/${repo}: ${repoRes.status}`);
  if (!releasesRes.ok) throw new Error(`GitHub /releases ${owner}/${repo}: ${releasesRes.status}`);
  // commits endpoint failure is non-fatal - we'll just not show latestCommit

  const repoData = (await repoRes.json()) as GitHubRepo;
  const releases = (await releasesRes.json()) as GitHubRelease[];
  const commits = commitsRes.ok ? ((await commitsRes.json()) as GitHubCommit[]) : [];

  const latest = releases[0] ?? null;
  const downloads = releases
    .flatMap((r) => r.assets ?? [])
    .reduce((sum, a) => sum + (a.download_count ?? 0), 0);

  const zipAsset =
    latest?.assets?.find((a) => a.name.endsWith(".zip")) ?? latest?.assets?.[0] ?? null;
  const downloadUrl = zipAsset
    ? zipAsset.browser_download_url
    : latest
      ? `${repoData.html_url}/archive/refs/tags/${latest.tag_name}.zip`
      : null;

  const commit = commits[0];
  const latestCommit = commit
    ? {
        sha: commit.sha.slice(0, 7),
        message: commit.commit.message.split("\n")[0].slice(0, 72),
        date: commit.commit.author.date,
        url: commit.html_url,
      }
    : null;

  return {
    kind: "oss",
    status: "ok",
    stars: repoData.stargazers_count,
    description: repoData.description,
    language: repoData.language,
    version: latest?.tag_name ?? null,
    releaseDate: latest?.published_at ?? null,
    downloads: releases.length > 0 ? downloads : null,
    downloadUrl,
    sourceUrl: repoData.html_url,
    latestCommit,
    // Workshop is merged in by the orchestrator (lib/data/index.ts) when the
    // project is a mod with a steamWorkshopUrl. The github fetcher itself
    // doesn't know about Steam.
    workshop: null,
  };
}

export function fetchGithubStats(owner: string, repo: string): Promise<OssStats> {
  return withCache<OssStats>(
    `github-${owner}-${repo}`,
    () => fetchGithubStatsLive(owner, repo),
    emptyOssStats(),
  );
}
