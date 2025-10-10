import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      ".nuxt/**",
      ".output/**", 
      "dist/**",
      "node_modules/**",
      "migrations/**",
      "*.generated.*"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt auto-imports
        useHead: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        navigateTo: "readonly",
        onMounted: "readonly",
        storeToRefs: "readonly",
        defineStore: "readonly",
        useLeagueStore: "readonly",
        $fetch: "readonly",
        defineNuxtConfig: "readonly",
      }
    }
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "vue/multi-word-component-names": "off"
    }
  }
]);
