/**
 * Unified stats fetch: routes a Project to the right fetcher and returns Stats.
 *
 * Only "oss" and "hosted" projects have async stats. "wip" projects render
 * synchronously from config and are rejected at the type level.
 */

import type { Project } from "../../config/projects";
import type { Stats } from "./types";
import { fetchGithubStats } from "./github";
import { fetchNyxStats } from "./nyx";

export type StatsfulProject = Extract<Project, { type: "oss" | "hosted" }>;

export async function fetchStats(project: StatsfulProject): Promise<Stats> {
  if (project.type === "oss") {
    return fetchGithubStats(project.owner, project.repo);
  }
  return fetchNyxStats(project.statsEndpoint);
}

export type { Stats, OssStats, HostedStats } from "./types";
