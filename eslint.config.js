import js from "@eslint/js";
import globals from "globals";
import security from "eslint-plugin-security";

export default [
  // generated or third-party code is not linted
  { ignores: ["dist/**", "node_modules/**", "activity-log-master/**"] },

  js.configs.recommended,          // code quality and bug rules
  security.configs.recommended,    // security rules

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
  },
];
