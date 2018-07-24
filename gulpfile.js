// project paths are set in package.json
const paths = require("./package.json").paths;

const gulp = require("gulp");
const cleanCSS = require('gulp-clean-css');;
const postcss = require("gulp-postcss");
const plumber = require("gulp-plumber");
const purgecss = require("gulp-purgecss");
const tailwindcss = require("tailwindcss");
const browserSync = require("browser-sync").create();
const pug = require('gulp-pug');

// Custom extractor for purgeCSS, to avoid stripping classes with `:` prefixes
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

// compiling tailwind CSS
gulp.task("css", () => {
  return gulp
    .src(paths.src.css + "*.css")
    .pipe(
      postcss([tailwindcss(paths.config.tailwind), require("autoprefixer")])
    )
    .pipe(
      purgecss({
        content: [paths.dist.base + "**/*.html"],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html", "js"]
          }
        ]
      })
    )
    .pipe(gulp.dest(paths.dist.css));
});

// browser-sync dev server
gulp.task("serve", ["css"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });

  gulp.watch(paths.src.views + "**/*.pug", ["views"]);
  gulp.watch(paths.src.css + "*.css", ["css"]);
  gulp.watch(paths.config.tailwind, ["css"]);
  gulp.watch(paths.dist.base + "*.html").on("change", browserSync.reload);
});


gulp.task('minify-css', () => {
  return gulp.src(paths.dist.css + '*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(paths.dist.css));
});

// default task
gulp.task("default", ["serve"]);

gulp.task('views', () => {
	return gulp.src('./src/views/**/*.pug')
		.pipe(plumber())
		.pipe(pug({}))
		.pipe(gulp.dest(paths.dist.base))
});