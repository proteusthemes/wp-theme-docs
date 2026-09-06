import { existsSync, readFileSync } from "node:fs";
import { buildAssets } from "./lib/assets.js";
import { resolveThemeFile } from "./lib/paths.js";

export default function (eleventyConfig) {
  let assets = {};
  const compiled = new Map();

  eleventyConfig.on("eleventy.before", async () => {
    compiled.clear();
    assets = await buildAssets();
  });

  eleventyConfig.addGlobalData("assets", () => assets);

  eleventyConfig.addNunjucksTag("part", (nunjucks) => ({
    tags: ["part"],

    parse(parser, nodes) {
      const token = parser.nextToken();
      const args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(token.value);
      return new nodes.CallExtension(this, "run", args);
    },

    run(context, name) {
      const theme = context.lookup("theme").name;
      const file = resolveThemeFile(theme, `includes/${name}.njk`);

      if (!existsSync(file)) {
        throw new Error(`Partial "${name}" not found for theme "${theme}"`);
      }

      let template = compiled.get(file);
      if (!template) {
        template = new nunjucks.Template(readFileSync(file, "utf8"), context.env, file, true);
        compiled.set(file, template);
      }

      return new nunjucks.runtime.SafeString(template.render(context.getVariables()));
    },
  }));

  eleventyConfig.ignores.add("src/*/includes/**");

  eleventyConfig.addWatchTarget("src/**/*.scss");
  eleventyConfig.addWatchTarget("src/**/scripts/*.js");
  eleventyConfig.addWatchTarget("src/**/data/*.yml");
  eleventyConfig.addWatchTarget("src/**/images/**");
  eleventyConfig.addWatchTarget("src/**/fonts/**");
  eleventyConfig.addWatchTarget("themes.json");

  return {
    dir: { input: "src", output: "build" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
