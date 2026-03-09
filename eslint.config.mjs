import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

const config = [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "legacy/**",
      "tests/setup/**",
      "public/mockServiceWorker.js",
      "next-env.d.ts"
    ]
  },
  ...nextVitals,
  ...nextTs,
  ...tseslint.config({
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  })
];

export default config;
