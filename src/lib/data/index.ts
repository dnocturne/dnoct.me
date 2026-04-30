/**
 * Unified stats fetch: routes a Project to the right fetcher and returns Stats.
 *
 * Only "oss" and "hosted" projects have async stats. "wip" projects render
 * synchronously from config and are rejected at the type level.
 *
 * Mod-role OSS projects with a steamWorkshopUrl get an extra parallel fetch
 * to Steam Workshop and the result is merged into the OssStats `workshop`
 * field. A failed Workshop fetch leaves `workshop: null` and is non-fatal.
 */

import type { Project } from "../../config/projects";
import type { Stats } from "./types";
import { fetchGithubStats } from "./github";
import { fetchNyxStats } from "./nyx";
import { fetchWorkshopStats } from "./steam-workshop";

export type StatsfulProject = Extract<Project, { type: "oss" | "hosted" }>;

export async function fetchStats(project: StatsfulProject): Promise<Stats> {
  if (project.type === "oss") {
    if (project.role === "mod" && project.steamWorkshopUrl) {
      const [github, workshop] = await Promise.all([
        fetchGithubStats(project.owner, project.repo),
        fetchWorkshopStats(project.steamWorkshopUrl),
      ]);
      return { ...github, workshop };
    }
    return fetchGithubStats(project.owner, project.repo);
  }
  return fetchNyxStats(project.statsEndpoint);
}

export type { Stats, OssStats, HostedStats } from "./types";
