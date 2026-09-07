# Documentation for ProteusThemes’ WordPress themes

This repository is for per-theme documentation for our themes.

## Installation

Clone this repository on your machine and run the following:

```sh
npm install

npm run build
```

That’s it!

The index files of the theme docs will be located in `/build/theme_name_goes_here/index.html`.

While you are writing, `npm start` runs a development server that rebuilds and reloads the docs whenever you save a file.

## How it works

All source files are in the `src` folder. In the `src` folder, there is a `master` folder, which contains a "default/boilerplate" documentation, from which you can then overwrite specific things in the single theme documentation. Single theme documentation overwrites are located in the `src/theme_name_goes_here` folders.

A theme file wins over the master file with the same path, and that is resolved while the docs are being built. Everything ends up in the `build` folder, which will hold the final **index.html** file for each theme, together with its stylesheet, script, images and fonts.

The stylesheet and the script are our own (no Bootstrap, no jQuery): the Sass partials in `src/master/sass` are compiled per theme, and `src/master/scripts/main.js` handles the table of contents and the mobile menus. The brand fonts (futura-pt and Merriweather) are loaded from the ProteusThemes Typekit kit, so they are not part of the build.

## How to edit documentation for a theme

It depends. Do you have to edit something in all theme documentations, or just in a single theme?

If you have to edit for all themes, then you should edit the code in `src/master` and then build all theme docs with `npm run build`.

If some themes have overridden the section in `src/master`, then you have to edit those files in the specific theme doc as well.

If you want to edit something just for a specific theme, then you have to overwrite the `master` file (copy the file you want to edit from `src/master` to the theme folder, keeping the folder hierarchy as it was in master) or just check in the theme folder, if this file is already there.

Before updating shared content, verify it against each affected theme's released code. Plugin inventories and required/recommended flags come from each theme's TGM configuration; registration, Customizer controls and shortcode attributes can differ by theme and distribution. Preserve section IDs used by navigation and external links. HairPress is retired: keep its archived content in theme overrides when changing shared sections. Build all pages and check section links, images and desktop/mobile rendering after changes. For visual verification, map the diff to rendered sections and inspect every changed region, including retained screenshots and navigation labels. Report complete desktop coverage separately from targeted mobile checks; structural link and image checks alone are not a visual review.

## How to create documentation for a new theme

In the root of this repos folder, there is a `themes.json` file which holds settings for each theme. All you have to do is make a new entry by copying an existing theme settings and changing them. For example here is the entry for BuildPress:

```json
{
    "name": "buildpress",
    "themename": "BuildPress",
    "creationdate": "November 4, 2014",
    "tfurl": "https://themeforest.net/item/buildpress-construction-business-wp-theme/9323981?ref=ProteusThemes",
    "themeheadertext": "BuildPress is a premium WordPress Theme for any kind of construction businesses and companies. It is our most advanced and sophisticated theme we built so far. It is very easy to setup and use with one click demo content import. Available only on ThemeForest!",
    "shutterstockurl": "https://www.shutterstock.com/"
}
```

The only other thing is to create a folder with theme name in the `src` folder (`src/theme_name_goes_here`).

Now you can start copying files in the new folder to overwrite the master files. Keep in mind that the folder structure has to stay the same as in the master folder.

Some files that you will most certainly have to overwrite are:

* `src/theme_name_goes_here/includes/content-includes/general/intro-text.njk`,
* `src/theme_name_goes_here/images/activate-theme.png`,
* `src/theme_name_goes_here/images/customize-theme.png`,
* `src/theme_name_goes_here/images/header-cover.jpg`,
* `src/theme_name_goes_here/data/sidebar.yml` (the sidebar navigation).

Theme-specific CSS goes into `src/theme_name_goes_here/sass/_theme.scss`, which is compiled into that theme’s stylesheet only and can use every token from the master `_vars.scss` with `@use "vars" as *;`. GrowthPress and MedicPress use it for their icon-font `@font-face` rules. Overriding `_vars.scss` itself is also possible, but the copy must then define every token the partials read, so prefer `_theme.scss` for additions.

A `src/theme_name_goes_here/scripts/main.js` file is optional: when it is there, it gets appended to the theme’s script bundle.
