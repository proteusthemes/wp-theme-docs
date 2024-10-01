# Documentation for ProteusThemes’ WordPress themes

This repository is for per-theme documentation for our themes.

## Installation

Clone this repository on your machine and run the following (you may already have `bower` and `grunt`, in which case skip those steps):

```sh
npm install -g bower
npm install -g grunt-cli

bower install
npm install

grunt buildAllThemes
```


That’s it!

The index files of the theme docs will be located in `/build/theme_name_goes_here/index.html`.

## How it works

All source files are in the `src` folder. In the `src` folder, there is a `master` folder, which contains a "default/boilerplate" documentation, from which you can then overwrite specific things in the single theme documentation. Single theme documentation overwrites are located in the `src/theme_name_goes_here` folders.

When you build these theme documentations, two new folders will appear in the root folder, called `prep` and `build`. `prep` folder is a middle stage folder, where everything gets prepared for the actual build process. `build` folder will hold the final **index.html** files for each theme. More on how to build these docs, can be found below.

## How to edit documentation for a theme

It depends. Do you have to edit something in all theme documentations, or just in a single theme?

If you have to edit for all themes, then you should edit the code in `src/master` and then build all theme docs with `grunt buildAllThemes`.

If some themes have overridden the section in `src/master`, then you have to edit those files in the specific theme doc as well.

If you want to edit something just for a specific theme, then you have to overwrite the `master` file (copy the file you want to edit from `src/master` to the theme folder, keeping the folder hierarchy as it was in master) or just check in the theme folder, if this file is already there. When you are done, you should build the single theme with `grunt buildSingleTheme:theme_name_goes_here`.

## How to create documentation for a new theme

In the root of this repos folder, there is a `themes-config.json` file which holds settings for each theme. All you have to do is make a new entry by copying an existing theme settings and changing them. For example here is the entry for BuildPress:

```json
{
    "name": "buildpress",
    "themename": "BuildPress",
    "creationdate": "November 4, 2014",
    "tfurl": "http://themeforest.net/item/buildpress-construction-business-wp-theme/9323981?ref=ProteusThemes",
    "themeheadertext": "BuildPress is a premium WordPress Theme for any kind of construction businesses and companies. It is our most advanced and sophisticated theme we built so far. It is very easy to setup and use with one click demo content import. Available only on ThemeForest!",
    "shutterstockurl": "https://www.shutterstock.com/"
}
```

The only other thing is to create a folder with theme name in the `src` folder (`src/theme_name_goes_here`).

Now you can start copying files in the new folder to overwrite the master files. Keep in mind that the folder structure has to stay the same as in the master folder.

Some files that you will most certainly have to overwrite are:

* `src/theme_name_goes_here/assemble/includes/content-includes/general/intro-text.hbs`,
* `src/theme_name_goes_here/images/activate-theme.png`,
* `src/theme_name_goes_here/images/customize-theme.png`,
* `src/theme_name_goes_here/images/header-cover.jpg`,
* `src/theme_name_goes_here/sass/_vars.scss` (change the `$primary-color` color).
