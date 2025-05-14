// import js from "@eslint/js";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";
// import globals from "globals";

// export default defineConfig([
//   {
//     files: ["**/*.{js,mjs,cjs,jsx}"],
//     plugins: { js },
//     extends: ["js/recommended"],
//     rules: {
//       "keyword-spacing": ["error", { before: true, after: true }],
//        "no-console": ["error"],
//       "padding-line-between-statements": [
//         "error",
//         // Add a blank line after return statements
//         { blankLine: "always", prev: "return", next: "*" },

//         // Add a blank line after blocks (like if, for, etc.)
//         { blankLine: "always", prev: "block-like", next: "*" },

//         // Add a blank line between expression statements
//         { blankLine: "always", prev: "expression", next: "expression" },

//         // Optional: add a blank line after variable declarations
//         { blankLine: "always", prev: ["const", "let", "var"], next: "expression" },
        
//       ],
//     },
//   },
//   {
//     files: ["**/*.{js,mjs,cjs,jsx}"],
//     languageOptions: {
//       globals: globals.browser,
//     },
//   },
//   pluginReact.configs.flat.recommended,
// ]);
