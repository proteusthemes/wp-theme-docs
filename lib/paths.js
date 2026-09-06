import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SRC = path.join(ROOT, "src");

export function resolveThemeFile(theme, rel) {
  const themeFile = path.join(SRC, theme, rel);
  return existsSync(themeFile) ? themeFile : path.join(SRC, "master", rel);
}
