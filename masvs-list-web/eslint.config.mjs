import globals from "globals";
import pluginJs from "@eslint/js";
import pluginAstro from "eslint-plugin-astro";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,astro}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  pluginJs.configs.recommended,
  pluginAstro.configs.recommended,
];
