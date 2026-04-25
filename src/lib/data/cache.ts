/**
 * Tiny on-disk cache used as a stale-fallback when live fetches fail.
 *
 * Local dev: writes to `.cache/{key}.json` at the repo root (gitignored).
 * Vercel:    writes to `/tmp/.cache/{key}.json`. Vercel's `/var/task` filesystem
 *            is read-only, but `/tmp` is writable and persists across warm
 *            invocations of the same function instance (cleared on cold start).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const CACHE_DIR = process.env.VERCEL
  ? path.join("/tmp", ".cache")
  : path.resolve(process.cwd(), ".cache");

const keyToPath = (key: string) => path.join(CACHE_DIR, `${key}.json`);

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(keyToPath(key), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(keyToPath(key), JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Writing cache is best-effort - don't break the request if the FS is read-only
    console.warn(`[cache] failed to write ${key}:`, err);
  }
}

/**
 * Try the live fetch, fall back to cached, fall back to `fallback`.
 * `status` in the result indicates which path was taken.
 */
export async function withCache<T extends { status: "ok" | "stale" | "unknown" }>(
  key: string,
  fetchLive: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    const fresh = await fetchLive();
    await writeCache(key, fresh);
    return fresh;
  } catch (err) {
    console.warn(`[data] live fetch failed for ${key}:`, err);
    const cached = await readCache<T>(key);
    if (cached) return { ...cached, status: "stale" };
    return fallback;
  }
}
