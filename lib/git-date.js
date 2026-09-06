import { execFileSync } from "node:child_process";
import { ROOT } from "./paths.js";

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function lastModified(themeName) {
  let day = "";

  try {
    day = execFileSync(
      "git",
      [
        "log",
        "-1",
        "--format=%cd",
        "--date=format:%Y-%m-%d",
        "--",
        `src/${themeName}`,
        "src/master",
        "themes.json",
      ],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
  } catch {
    day = "";
  }

  const date = day ? new Date(`${day}T00:00:00Z`) : new Date();

  return formatter.format(Number.isNaN(date.getTime()) ? new Date() : date);
}
