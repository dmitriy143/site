
const project_folder = require('path').basename(__dirname); //результат работы gulp (сборка - выгружать на сервер) - название паки будет таким же как название проекта
const source_folder = "_src";  //исходники

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/"
  },
  src: {
    pug: [source_folder + "/*.pug", "!" + source_folder + "/_*.pug"],
    css: source_folder + "/scss/style.scss",
    js: [source_folder + "/js/main.js"],
    img: [source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", source_folder + "/blocks/**/*.{jpg,png,svg,gif,ico,webp}"],
    fonts: source_folder + "/fonts/*.*"
  },
  watch: {
    pug: [source_folder + "/*.pug", source_folder + "/blocks/**/*.pug"],
    css: [source_folder + "/scss/*.scss", source_folder + "/blocks/**/*.scss"],
    js: source_folder + "/js/**/*.js",
    img: [source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", source_folder + "/blocks/**/*.{jpg,png,svg,gif,ico,webp}"],
  },
  clean: "./" + project_folder + "/"
}

const { src, dest } = require('gulp'),
  { series, parallel } = require('gulp'),
  gulp = require('gulp'),
  gulpPug = require('gulp-pug'),
  scss = require('gulp-sass')(require('sass')),
  del = require('del'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter'),
  fs = require('fs'),
  browsersync = require('browser-sync').create();

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false,
    tunnel: true,
  })
};

function pug() {
  return src(path.src.pug)
    .pipe(gulpPug({
      pretty: true
    }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

// function webpHtml() {
//   return src(path.build.html + "/index.html")
//     .pipe(webphtml())
//     .pipe(dest(path.build.html))
//     .pipe(browsersync.stream())
// }

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.build.css))
    // .pipe(clean_css())
    // .pipe(
    //   rename({
    //     extname: ".min.css"
    //   })
    // )
    // .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(concat('script.js'))
    .pipe(dest(path.build.js))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(uglify())
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(rename({ dirname: '' })) //чтобы копировать файлы без папок
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(rename({ dirname: '' })) //чтобы копировать файлы без папок
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

// function fonts() {
//   src(path.src.fonts)
//     .pipe(ttf2woff())
//     .pipe(dest(path.build.fonts))
//   return src(path.src.fonts)
//     .pipe(ttf2woff2())
//     .pipe(dest(path.build.fonts))
// }
function fonts() {
  src(path.src.fonts)
    .pipe(dest(path.build.fonts))
}

// function otf2ttf() {
//   return src(source_folder + "/fonts/*.otf")
//     .pipe(fonter({
//       formats: ['ttf']
//     }))
//     .pipe(dest(source_folder + '/fonts/'))
// }

// function fontsStyle() {
//   fs.readdir(path.build.fonts, (err, items) => {
//     if (err) throw err
//     let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
//     if (file_content == '') {
//       let file;
//       items.forEach(file_name => {
//         file_name = file_name.split('.')[0]
//         if (file !== file_name) {
//           fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + file_name + '", "' + file_name + '", "400", "normal");\r\n', (err) => { if (err) throw err });
//         }
//         file = file_name
//       })
//     } else {
//       return console.log('file \'fonts.scss\' is not empty')
//     }
//   })
// }

function watchFiles() {
  gulp.watch(path.watch.pug, pug)
  gulp.watch(path.watch.css, css)
  gulp.watch([path.watch.js], js)
  gulp.watch(path.watch.img, images)
}

function clean() {
  return del(path.clean)
}

const build = series(clean, parallel(pug, css, images), js, fonts);
const watch = parallel(build, watchFiles, browserSync);

// exports.fontsStyle = fontsStyle;
// exports.otf2ttf = otf2ttf;
exports.fonts = fonts;
// exports.webpHtml = webpHtml;
exports.images = images;
exports.js = js;
exports.css = css;
exports.pug = pug;
exports.build = build;
exports.watch = watch;
exports.default = watch;


