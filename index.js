const babel = require("@babel/core");
const fs = require("fs");
var path = require("path");
const { printer, md5 } = require("./script/util");
const { getOptions, getBabelOptions } = require("./script/config");

const defaultOptions = {};

const gulp = require("gulp");

// require("./script/tasks/css/build")();
// require("./script/tasks/js/build")();
// console.log(path.resolve(process.cwd(), 'fetool.config.js'))
// console.log(require.resolve(path.resolve(process.cwd(), 'fetool.config.js')))
// // require("./script/tasks/main/build")();

require("./script/tasks/main/build-dev")();
require("./script/tasks/main/watch")();

gulp.start("main:build-dev");

// const resolve = require("resolve");
// console.log(
//   resolve.sync("react.js", {
//     moduleDirectory: "common123",
//     basedir: "/Users/mengchen/project/fetool/src/m/page/jsx"
//   })
// );
// gulp.start('js:build', () => {
//   // gulp.start('main:build-dev')
// })

// gulp.start("main:watch", () => {
//   // gulp.start('main:build-dev')
// });

// console.log(getOptions())
// console.log(path.relative('/Users/mengchen/project/fetool/src/channel_module/loading', '/Users/mengchen/project/fetool/src/channel_module/loading/index.js'))

// Object.assign(getBabelOptions({})

// var result = babel.transformFileSync('./src/m/channel_page/baobei_add/index.js', Object.assign(getBabelOptions({
//   isOldJSEnabled: true,
//   isES6Enabled: false,
//   isReactEnabled: false
// }), defaultOptions))

// fs.writeFileSync('./dist/ttt/index.js', result.code)

// var result = babel.transformFileSync('./src/m/page/es6/index.es6', Object.assign(getBabelOptions({
//   isOldJSEnabled: false,
//   isES6Enabled: true,
//   isReactEnabled: false
// }), defaultOptions))

// fs.writeFileSync('./es6.js', result.code)

// var result = babel.transformFileSync('./src/jsx/index.jsx', Object.assign(getBabelOptions({
//   isOldJSEnabled: false,
//   isES6Enabled: true,
//   isReactEnabled: true
// }), defaultOptions))

// fs.writeFileSync('./dist/jsx/index.js', result.code)

// console.log(result)

// require("@babel/register")({
//   // This will override `node_modules` ignoring - you can alternatively pass
//   // an array of strings to be explicitly matched or a regex / glob
//   ignore: [],
// });

// {
//   plugins: [
//       require("./script/babel-plugin-tinytool"),
//       require("./script/babel-plugin-transform-modules-amd")
//     ]
//     // compact: true,
//     // moduleIds: true,
//     // moduleId: '123',
//     // // moduleRoot: '/Users/mengchen/project',
//     // getModuleId: (name) => {
//     //   console.log(name)
//     //   return name
//     // }
// }
//
