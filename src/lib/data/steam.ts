/**
 * Steam Web API fetcher for current game activity.
 *
 * Endpoint: GET ISteamUser/GetPlayerSummaries/v0002/
 * Docs:     https://developer.valvesoftware.com/wiki/Steam_Web_API
 *
 * Requirements:
 *   - `STEAM_API_KEY` env var (free key from https://steamcommunity.com/dev/apikey)
 *   - The target user's "Game details" privacy must be set to Public on Steam,
 *     otherwise `gameextrainfo` and `gameid` are omitted from the response.
 */

import { withCache } from "./cache";

const FETCH_TIMEOUT_MS = 5000;

interface SteamPlayer {
  steamid: string;
  personastate: number;
  gameextrainfo?: string;
  gameid?: string;
}

interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayer[];
  };
}

export interface SteamPresence {
  status: "ok" | "stale" | "unknown";
  /** Currently-playing game, or null if the user is not in a game */
  game: {
    name: string;
    appId: string;
  } | null;
}

const empty = (): SteamPresence => ({ status: "unknown", game: null });

async function fetchSteamLive(steamId: string): Promise<SteamPresence> {
  const apiKey = import.meta.env.STEAM_API_KEY ?? process.env.STEAM_API_KEY;
  if (!apiKey) throw new Error("STEAM_API_KEY not set");

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "dnoct-me-portfolio" },
  });

  if (!res.ok) throw new Error(`Steam API: ${res.status}`);

  const json = (await res.json()) as SteamPlayerSummariesResponse;
  const player = json.response?.players?.[0];
  if (!player) throw new Error("Steam: no player in response");

  return {
    status: "ok",
    game: player.gameextrainfo
      ? { name: player.gameextrainfo, appId: player.gameid ?? "" }
      : null,
  };
}

export function fetchSteamPresence(steamId: string): Promise<SteamPresence> {
  return withCache<SteamPresence>(
    `steam-${steamId}`,
    () => fetchSteamLive(steamId),
    empty(),
  );
}
