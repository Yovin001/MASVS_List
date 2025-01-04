import globals from "globals";
import pluginJs from "@eslint/js";
import pluginAstro from "eslint-plugin-astro";

/** @type {import('eslint').Linter.Config} */
export default {
  files: ["**/*.{js,mjs,astro}"],
  languageOptions: {
    sourceType: "commonjs",
    globals: globals.browser,
  },
  extends: [
    "eslint:recommended",
    pluginJs.configs.recommended,
    pluginAstro.configs.recommended,
  ],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
  },
};
