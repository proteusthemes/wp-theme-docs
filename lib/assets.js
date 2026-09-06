import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import * as sass from "sass";
import { ROOT, SRC, resolveThemeFile } from "./paths.js";

const BUILD = path.join(ROOT, "build");
const BOOTSTRAP = path.join(ROOT, "node_modules/bootstrap-sass/assets");

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
  mkdirSync(dir, { recursive: true });
  const file = `${name}-${hash(content)}.${ext}`;
  writeFileSync(path.join(dir, file), content);
  return file;
}

function buildCss(theme) {
  const entry = resolveThemeFile(theme, "sass/main.scss");
  const result = sass.compileString(readFileSync(entry, "utf8"), {
    url: pathToFileURL(path.join(SRC, theme, "sass/main.scss")),
    loadPaths: [path.join(SRC, "master/sass"), path.join(BOOTSTRAP, "stylesheets")],
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
  });

  return writeAsset(path.join(BUILD, theme, "js"), "main", "js", code);
}

function copyAssets(theme) {
  const dest = path.join(BUILD, theme);

  cpSync(path.join(SRC, "master/images"), path.join(dest, "images"), { recursive: true });

  const themeImages = path.join(SRC, theme, "images");
  if (existsSync(themeImages)) {
    cpSync(themeImages, path.join(dest, "images"), { recursive: true });
  }

  cpSync(path.join(BOOTSTRAP, "fonts/bootstrap"), path.join(dest, "fonts/bootstrap"), {
    recursive: true,
  });

  const themeFonts = path.join(SRC, theme, "fonts");
  if (existsSync(themeFonts)) {
    cpSync(themeFonts, path.join(dest, "fonts"), { recursive: true });
  }
}

export async function buildAssets(themes) {
  const manifest = {};

  for (const theme of themes) {
    copyAssets(theme.name);
    manifest[theme.name] = {
      css: buildCss(theme.name),
      js: await buildJs(theme.name),
    };
  }

  return manifest;
}
