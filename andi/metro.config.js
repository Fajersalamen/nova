// Explicit so the `@/*` path alias in tsconfig.json (used everywhere in
// src/ and app/) resolves at runtime, not just during type-checking —
// Expo's default Metro config (SDK 50+) reads tsconfig "paths" for this.
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
