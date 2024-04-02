// const { series, parallel, src, dest, watch } = require('gulp');
// const sass = require("gulp-sass")(require("sass"));
// const ts = require("gulp-typescript");
// const tsProject = ts.createProject('tsconfig.json');
// const browserSync = require("browser-sync");

// const dir = {
//     html: {
//         src: "./src/**/*.html",
//         dist: "./dist/"
//     },
//     style: {
//         src: "./src/scss/**/*.scss",
//         dist: "./dist/css/"
//     },
//     script: {
//         src: "./src/ts/**/*.ts",
//         dist: "./dist/js/"
//     }
// };

// function compileSass() {
//     return src(dir.style.src)
//         .pipe(sass())
//         .pipe(dest(dir.style.dist));
// }

// function buildTs() {
//     return src(dir.script.src)
//         .pipe(tsProject())
//         .pipe(dest(dir.script.dist));
// }

// function copyHtml() {
//     return src(dir.html.src)
//         .pipe(dest(dir.html.dist));

// }

// function watchFiles() {
//     watch(dir.style.src, compileSass);
//     watch(dir.script.src, buildTs);
//     watch(dir.html.src, copyHtml);
//     watch("./dist/**", function () { browserSync.reload(); });
// }

// function browserSyncFunc() {
//     browserSync({
//         server: {
//             baseDir: "./dist/",
//             index: "index.html"
//         },
//         reloadOnRestart: true
//     });
// };

// exports.default =
//     parallel(
//         series(
//             parallel(compileSass, buildTs, copyHtml),
//             watchFiles
//         ),
//         browserSyncFunc
//     );
