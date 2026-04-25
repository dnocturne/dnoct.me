/**
 * Fetcher for Nyx's public-stats endpoint.
 * The endpoint is implemented in the Nyx monorepo (out of scope here).
 * Expected response shape is documented in the portfolio design spec.
 */

import type { HostedStats } from "./types";
import { emptyHostedStats } from "./types";
import { withCache } from "./cache";

const FETCH_TIMEOUT_MS = 5000;

interface NyxPublicStatsResponse {
  online: boolean;
  uptimeMs: number;
  servers: number;
  users: number;
  lastSeen: string;
}

async function fetchNyxStatsLive(endpoint: string): Promise<HostedStats> {
  const res = await fetch(endpoint, {
    headers: { "User-Agent": "dnoct-me-portfolio" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`Nyx stats ${endpoint}: ${res.status}`);

  const data = (await res.json()) as NyxPublicStatsResponse;

  return {
    kind: "hosted",
    status: "ok",
    online: data.online,
    uptimeMs: data.uptimeMs,
    servers: data.servers,
    users: data.users,
    lastSeen: data.lastSeen,
  };
}

export function fetchNyxStats(endpoint: string): Promise<HostedStats> {
  const key = `nyx-${new URL(endpoint).hostname}`;
  return withCache<HostedStats>(key, () => fetchNyxStatsLive(endpoint), emptyHostedStats());
}
