/**
 * Language colors mirroring GitHub Linguist's palette.
 * Used to render the small colored dot before each project's language pill,
 * matching how GitHub itself displays language tags.
 *
 * Source: https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml
 *
 * This is a hand-picked subset focused on languages the portfolio actually
 * uses (or is likely to add). For unknown languages, `getLanguageColor`
 * returns null and the consumer should fall back to a neutral dot or no dot
 * at all.
 */

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Lua: "#000080",
  Python: "#3572a5",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  YAML: "#cb171e",
  JSON: "#292929",
  Markdown: "#083fa1",
  Dockerfile: "#384d54",
  Astro: "#ff5a03",
  Svelte: "#ff3e00",
  Vue: "#41b883",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  PowerShell: "#012456",
  R: "#198CE7",
  Julia: "#a270ba",
  Nix: "#7e7eff",
  Zig: "#ec915c",
  Crystal: "#000100",
  Clojure: "#db5855",
  Erlang: "#B83998",
  OCaml: "#3be133",
  // Game / mod scripting (Linguist may or may not detect these specifically;
  // GitHub commonly falls back to YAML/Lua for Paradox + FiveM repos).
  GDScript: "#355570",
  GLSL: "#5686a5",
  // AMPL = "A Mathematical Programming Language". Shows up on Paradox-mod
  // repos because AMPL claims the `.mod` extension in Linguist's database
  // and CK3 uses `.mod` for its mod-descriptor files, so Linguist
  // misclassifies the repo. Color matches GitHub's tag.
  AMPL: "#E6EFBB",
};

export function getLanguageColor(language: string | null): string | null {
  if (!language) return null;
  return LANGUAGE_COLORS[language] ?? null;
}
