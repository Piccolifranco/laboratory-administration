import next from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      // UTF-16 LE encoded; ESLint reports it as "binary" and refuses to parse.
      // The file is a valid TypeScript type-definition module otherwise.
      "types/supabase.ts",
      // Build / vendor / config noise that ESLint shouldn't walk.
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
  ...next,
];