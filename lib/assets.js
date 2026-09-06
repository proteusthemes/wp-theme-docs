import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import * as sass from "sass";
import { ROOT, SRC, resolveThemeFile } from "./paths.js";

const BUILD = path.join(ROOT, "build");
const BOOTSTRAP = path.join(ROOT, "node_modules/bootstrap-sass/assets");
const IMAGE_EXTENSIONS = new Set([".png", ".gif", ".jpg", ".jpeg", ".ico", ".svg"]);

const JS_VENDOR = [
  path.join(ROOT, "node_modules/jquery/dist/jquery.js"),
  ...["transition", "collapse", "affix", "scrollspy", "dropdown"].map((name) =>
    path.join(BOOTSTRAP, "javascripts/bootstrap", `${name}.js`)
  ),
];

function hash(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

function writeAsset(dir, name, ext, content) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const file = `${name}-${hash(content)}.${ext}`;
  writeFileSync(path.join(dir, file), content);
  return file;
}

function sassRoots(theme) {
  return [
    path.join(SRC, theme, "sass"),
    path.join(SRC, "master/sass"),
    path.join(BOOTSTRAP, "stylesheets"),
  ];
}

function sassCandidates(rel) {
  const dir = path.posix.dirname(rel);
  const name = path.posix.basename(rel);
  const base = name.endsWith(".scss") ? name.slice(0, -5) : name;
  const names = [`${base}.scss`, `_${base}.scss`, `${base}/index.scss`, `${base}/_index.scss`];
  if (name !== base) names.unshift(name);
  return names.map((file) => (dir === "." ? file : `${dir}/${file}`));
}

function resolveSassLoad(theme, rel) {
  for (const root of sassRoots(theme)) {
    for (const candidate of sassCandidates(rel)) {
      const file = path.join(root, candidate);
      if (existsSync(file)) return { file, rel: candidate };
    }
  }
  return null;
}

function parseThemeUrl(url) {
  const { host, pathname } = new URL(url);
  return { theme: host, rel: decodeURIComponent(pathname).replace(/^\/+/, "") };
}

export const themeImporter = {
  canonicalize(url) {
    if (!url.startsWith("theme:")) return null;

    const { theme, rel } = parseThemeUrl(url);
    const found = resolveSassLoad(theme, rel);

    return found ? new URL(`theme://${theme}/${found.rel}`) : null;
  },

  load(canonicalUrl) {
    const { theme, rel } = parseThemeUrl(canonicalUrl);
    const found = resolveSassLoad(theme, rel);

    return found ? { contents: readFileSync(found.file, "utf8"), syntax: "scss" } : null;
  },
};

function buildCss(theme) {
  const entry = resolveThemeFile(theme, "sass/main.scss");
  const result = sass.compileString(readFileSync(entry, "utf8"), {
    url: new URL(`theme://${theme}/main.scss`),
    importer: themeImporter,
    style: "compressed",
    silenceDeprecations: ["import", "if-function", "global-builtin", "color-functions"],
  });
  return writeAsset(path.join(BUILD, theme, "stylesheets"), "main", "css", result.css);
}

async function buildJs(theme) {
  const sources = [...JS_VENDOR];
  const themeScript = path.join(SRC, theme, "scripts/main.js");
  if (existsSync(themeScript)) sources.push(themeScript);

  const bundle = sources.map((file) => readFileSync(file, "utf8")).join("\n");
  const { code } = await esbuild.transform(bundle, {
    minify: true,
    legalComments: "none",
    target: "es2015",
  });

  return writeAsset(path.join(BUILD, theme, "js"), "main", "js", code);
}

function copyImages(from, to) {
  cpSync(from, to, {
    recursive: true,
    filter: (src) =>
      statSync(src).isDirectory() || IMAGE_EXTENSIONS.has(path.extname(src).toLowerCase()),
  });
}

function copyAssets(theme) {
  const dest = path.join(BUILD, theme);

  copyImages(path.join(SRC, "master/images"), path.join(dest, "images"));

  const themeImages = path.join(SRC, theme, "images");
  if (existsSync(themeImages)) {
    copyImages(themeImages, path.join(dest, "images"));
  }

  cpSync(path.join(BOOTSTRAP, "fonts/bootstrap"), path.join(dest, "fonts/bootstrap"), {
    recursive: true,
  });

  const themeFonts = path.join(SRC, theme, "fonts");
  if (existsSync(themeFonts)) {
    cpSync(themeFonts, path.join(dest, "fonts"), { recursive: true });
  }
}

export async function buildAssets() {
  const themes = JSON.parse(readFileSync(path.join(ROOT, "themes.json"), "utf8"));
  const manifest = {};

  for (const { name } of themes) {
    copyAssets(name);
    manifest[name] = {
      css: buildCss(name),
      js: await buildJs(name),
    };
  }

  return manifest;
}
