/**
 * Source of truth for the portfolio's project tiles.
 *
 * Three shapes:
 *   - "hosted": live products (like nyx) with a public stats endpoint. Tile
 *      shows live status, server/user counts, uptime, and an invite CTA.
 *   - "wip":    actively-built projects (like vgrp.lt) with no public API.
 *      Tile is description-led with a primary CTA + optional extra links.
 *      No async stats; renders synchronously.
 *   - "oss":    published GitHub repos. `role` further shapes the tile:
 *      - "library" → foundation code, no download CTA, view-source only
 *      - "plugin"  → end-user installable; shows a download CTA when releases exist
 *      - "mod"     → distributed via Steam Workshop; CTA links to the Workshop URL
 */

export type Project =
  | {
      type: "oss";
      role: "library" | "plugin" | "mod";
      name: string;
      owner: string;
      repo: string;
      /** Overrides the GitHub repo description if set */
      tagline?: string;
      /** Short author's note: why it exists / what it's for */
      note?: string;
      /**
       * Modrinth project URL. When set, renders a small "modrinth" tag in the
       * stats line. Use the full canonical URL (e.g.
       * "https://modrinth.com/plugin/afflictions").
       */
      modrinthUrl?: string;
      /**
       * Steam Workshop URL. Required for "mod" role: drives the primary
       * "install on steam" CTA in place of GitHub-release downloads.
       */
      steamWorkshopUrl?: string;
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
    }
  | {
      type: "wip";
      name: string;
      /** Public-facing URL, also the destination of the primary CTA button */
      url: string;
      /** Optional override for the primary CTA label. Defaults to "visit site". */
      ctaLabel?: string;
      /** Short punchy line under the title */
      tagline: string;
      /** Optional 2-3 sentence paragraph filling out the tile */
      description?: string;
      /** Optional feature pills rendered under the description */
      features?: string[];
      /** Optional tech-stack pills rendered near the CTA */
      tech?: string[];
      /** Short author's note: origin / motivation */
      note?: string;
      /** Additional link buttons rendered beside the primary CTA (Discord, wiki, donations, etc.) */
      links?: Array<{ label: string; href: string }>;
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
    type: "wip",
    name: "vgrp.lt",
    url: "https://vgrp.lt",
    tagline: "A custom RageMP server. More soon.",
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
    modrinthUrl: "https://modrinth.com/plugin/afflictions",
    note: "Built for my work-in-progress Minecraft server. Also decided to open source it since it's a neat little plugin and might be useful to other server owners.",
  },
  {
    type: "oss",
    role: "mod",
    name: "ck3_immortality",
    owner: "dnocturne",
    repo: "ck3_immortality",
    steamWorkshopUrl: "https://steamcommunity.com/sharedfiles/filedetails/?id=3716732113",
    note: "An immortality mod for Crusader Kings III which I forked, updated and play with.",
  },
];
