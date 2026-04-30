/**
 * Steam Workshop stats fetcher.
 *
 * Uses the public `ISteamRemoteStorage/GetPublishedFileDetails/v1/` endpoint,
 * which is unauthenticated (no STEAM_API_KEY required) and returns the same
 * counters Steam shows on the Workshop page itself: lifetime unique visitors,
 * current subscribers, and current favorites.
 *
 * Wrapped in `withCache` so a failed live fetch falls back to the last good
 * snapshot rather than rendering zeros.
 */

import type { Status, WorkshopStats } from "./types";
import { withCache } from "./cache";

const FETCH_TIMEOUT_MS = 5000;
const ENDPOINT =
  "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/";

interface PublishedFileDetails {
  publishedfileid: string;
  // Steam result codes: 1 = OK, 9 = private/hidden, 17 = banned, etc.
  result: number;
  views?: number;
  subscriptions?: number;
  favorited?: number;
  lifetime_subscriptions?: number;
  lifetime_favorited?: number;
}

interface GetPublishedFileDetailsResponse {
  response?: {
    result: number;
    resultcount: number;
    publishedfiledetails?: PublishedFileDetails[];
  };
}

/** Pull the numeric publishedfileid out of a Workshop URL. */
export function extractWorkshopId(url: string): string | null {
  const match = url.match(/[?&]id=(\d+)/);
  return match ? match[1] : null;
}

interface CachedWorkshopStats extends WorkshopStats {
  status: Status;
}

const emptyCachedWorkshopStats: CachedWorkshopStats = {
  status: "unknown",
  views: 0,
  subscribers: 0,
  favorites: 0,
};

async function fetchWorkshopStatsLive(id: string): Promise<CachedWorkshopStats> {
  // The endpoint expects POST + form-encoded body; sending JSON returns 200
  // with an empty payload, which is the most fun debugging session in the world.
  const body = new URLSearchParams();
  body.append("itemcount", "1");
  body.append("publishedfileids[0]", id);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "dnoct-me-portfolio",
    },
    body: body.toString(),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`Steam Workshop API: ${res.status}`);

  const data = (await res.json()) as GetPublishedFileDetailsResponse;
  const item = data.response?.publishedfiledetails?.[0];

  if (!item || item.result !== 1) {
    throw new Error(
      `Workshop item ${id} not retrievable (result=${item?.result ?? "missing"})`,
    );
  }

  return {
    status: "ok",
    views: item.views ?? 0,
    subscribers: item.subscriptions ?? 0,
    favorites: item.favorited ?? 0,
  };
}

/**
 * Fetch Workshop stats for a given Steam Workshop URL. Returns null if the
 * URL is malformed (no extractable id) or if both the live API and the local
 * cache are empty so we don't render fake "0 / 0 / 0" zeros.
 */
export async function fetchWorkshopStats(
  workshopUrl: string,
): Promise<WorkshopStats | null> {
  const id = extractWorkshopId(workshopUrl);
  if (!id) return null;

  const result = await withCache<CachedWorkshopStats>(
    `workshop-${id}`,
    () => fetchWorkshopStatsLive(id),
    emptyCachedWorkshopStats,
  );

  if (result.status === "unknown") return null;

  // Strip the cache-status field so callers get a clean WorkshopStats.
  const { status: _status, ...stats } = result;
  return stats;
}
