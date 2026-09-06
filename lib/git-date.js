import { execFileSync } from "node:child_process";
import { ROOT } from "./paths.js";

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function lastModified(themeName) {
  let iso = "";

  try {
    iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", `src/${themeName}`, "src/master"],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
  } catch {
    iso = "";
  }

  const date = iso ? new Date(iso) : new Date();

  return formatter.format(Number.isNaN(date.getTime()) ? new Date() : date);
}
