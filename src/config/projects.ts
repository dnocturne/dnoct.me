/**
 * Source of truth for the portfolio's three project tiles.
 *
 * OSS projects have a `role` that shapes the tile:
 *   - "library" → foundation code, no download CTA, view-source only
 *   - "plugin"  → end-user installable; shows a download CTA when releases exist
 *
 * Hosted projects (like nyx) have their own richer shape with a description,
 * feature pills, and tech stack.
 */

export type Project =
  | {
      type: "oss";
      role: "library" | "plugin";
      name: string;
      owner: string;
      repo: string;
      /** Overrides the GitHub repo description if set */
      tagline?: string;
      /** Short author's note: why it exists / what it's for */
      note?: string;
    }
  | {
      type: "hosted";
      name: string;
      /** Public-facing URL shown on the tile */
      url: string;
      /** Endpoint returning the NyxPublicStatsResponse shape */
      statsEndpoint: string;
      /** Primary CTA target */
      inviteUrl: string;
      /** Short punchy line under the title */
      tagline: string;
      /** 2–3 sentence paragraph filling out the tile */
      description: string;
      /** Small feature pills rendered under the description */
      features: string[];
      /** Tech-stack pills rendered near the CTA */
      tech: string[];
      /** Short author's note: origin / motivation */
      note?: string;
    };

export const projects: Project[] = [
  {
    type: "hosted",
    name: "nyx",
    url: "https://nyx.cool",
    statsEndpoint: "https://nyx.cool/api/public-stats",
    inviteUrl: "https://nyx.cool/install",
    tagline: "A modern Discord bot for communities.",
    description:
      "Plugin-driven moderation, analytics, and automation with a full web panel. Self-hosted on bare metal and built to stay online.",
    features: ["Moderation", "Plugins", "Analytics", "Custom commands", "Premium"],
    tech: ["Next.js", "discord.js", "Postgres", "Better Auth"],
    note:
      "Originally built for personal use and as a learning experience. Opened up to the public and expanded to cover anything Discord-related.",
  },
  {
    type: "oss",
    role: "library",
    name: "basalt",
    owner: "dnocturne",
    repo: "basalt",
    note:
      "A shared foundation I shade into my own Minecraft plugins so I'm not rewriting the same boilerplate on every project.",
  },
  {
    type: "oss",
    role: "plugin",
    name: "afflictions",
    owner: "dnocturne",
    repo: "afflictions",
    note: "Built for my work-in-progress Minecraft server. Also decided to open source it since it's a neat little plugin and might be useful to other server owners.",
  },
];
