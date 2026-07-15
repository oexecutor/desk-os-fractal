// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.netlify/**",
      "**/node_modules/**",
      "release/**",
      "coverage/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "document",
          property: "write",
          message: "document.write is not allowed.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "AssignmentExpression[left.property.name='innerHTML']",
          message:
            "innerHTML is forbidden for user content (CLAUDE.md). Render text via safe APIs.",
        },
      ],
    },
  },
  {
    files: ["apps/web/public/sw.js"],
    languageOptions: {
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        URL: "readonly",
      },
    },
  },
  prettier,
);
