import { readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { lastModified } from "../../lib/git-date.js";
import { ROOT, resolveThemeFile } from "../../lib/paths.js";

export default function () {
  const themes = JSON.parse(readFileSync(path.join(ROOT, "themes.json"), "utf8"));

  return themes.map((theme) => ({
    ...theme,
    changelogUrl: `https://www.proteusthemes.com/wordpress-themes/${theme.name}/#go_changelog`,
    lastModified: lastModified(theme.name),
    sidebar: yaml.load(readFileSync(resolveThemeFile(theme.name, "data/sidebar.yml"), "utf8")),
  }));
}
