/// <reference types="astro/client" />

// Side-effect CSS imports (e.g. `import "../styles/global.css"`).
// Astro's bundler handles these at runtime; this declaration tells the
// TypeScript language server they are valid modules with no typed exports.
declare module "*.css";

// Astro's `server:defer`, `client:*`, and `transition:*` directives are
// injected by the compiler at runtime but aren't automatically reflected on
// locally-authored component `Props` interfaces. Augment IntrinsicAttributes
// so any component can accept these directives without TS warnings.
declare namespace astroHTML.JSX {
  interface IntrinsicAttributes {
    "server:defer"?: boolean;
    "client:load"?: boolean;
    "client:idle"?: boolean;
    "client:visible"?: boolean;
    "client:media"?: string;
    "client:only"?: boolean | string;
  }
}

// `@vercel/speed-insights/astro` and `@vercel/analytics/astro` both ship a
// `component.ts` that re-exports `./index.astro` with their own internal
// `@ts-expect-error`, because TypeScript can't introspect .astro files
// through a .ts re-export. The runtime resolves correctly; this declaration
// just satisfies the language server so it stops flagging the use sites
// with TS2604 ("not a valid component").
declare module "@vercel/speed-insights/astro" {
  const SpeedInsights: (_props?: Record<string, unknown>) => unknown;
  export default SpeedInsights;
}

declare module "@vercel/analytics/astro" {
  const Analytics: (_props?: Record<string, unknown>) => unknown;
  export default Analytics;
}
