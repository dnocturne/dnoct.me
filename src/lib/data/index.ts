/**
 * Unified stats fetch: routes a Project to the right fetcher and returns Stats.
 */

import type { Project } from "../../config/projects";
import type { Stats } from "./types";
import { fetchGithubStats } from "./github";
import { fetchNyxStats } from "./nyx";

export async function fetchStats(project: Project): Promise<Stats> {
  if (project.type === "oss") {
    return fetchGithubStats(project.owner, project.repo);
  }
  return fetchNyxStats(project.statsEndpoint);
}

export type { Stats, OssStats, HostedStats } from "./types";
