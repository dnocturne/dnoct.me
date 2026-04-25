/**
 * Shared types for project stats fetched at server-island render time.
 * Both variants use `status` so the UI can render consistently regardless of type.
 */

export type Status = "ok" | "stale" | "unknown";

export interface LatestCommit {
  message: string;
  date: string; // ISO
  url: string;
  sha: string;
}

export interface OssStats {
  kind: "oss";
  status: Status;
  stars: number | null;
  description: string | null;
  language: string | null;
  version: string | null;
  releaseDate: string | null; // ISO
  downloads: number | null;
  downloadUrl: string | null;
  sourceUrl: string | null;
  latestCommit: LatestCommit | null;
}

export interface HostedStats {
  kind: "hosted";
  status: Status;
  online: boolean;
  uptimeMs: number | null;
  servers: number | null;
  users: number | null;
  lastSeen: string | null; // ISO
}

export type Stats = OssStats | HostedStats;

export const emptyOssStats = (): OssStats => ({
  kind: "oss",
  status: "unknown",
  stars: null,
  description: null,
  language: null,
  version: null,
  releaseDate: null,
  downloads: null,
  downloadUrl: null,
  sourceUrl: null,
  latestCommit: null,
});

export const emptyHostedStats = (): HostedStats => ({
  kind: "hosted",
  status: "unknown",
  online: false,
  uptimeMs: null,
  servers: null,
  users: null,
  lastSeen: null,
});
