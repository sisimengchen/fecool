const { getOptions } = require("./script/config");
const browserSync = require("browser-sync").create("fetool");
const globalOptions = getOptions();
const path = require("path");

browserSync.init({
  port: 8092,
  server: {
    baseDir: globalOptions.distDir,
    directory: false
  },
  single: true, // 启用单页面模式
  open: "external", // 启动浏览器 "external"
  host: "feresource.com",
  watch: true,
  files: [path.resolve(globalOptions.distDir, "**", `*.*`)]
  // middleware: [middleware]
});

// const proxy = require('http-proxy-middleware')

// const blackMenu = {
//   '.html': true,
//   '.js': true,
//   '.css': true,
//   '.png': true,
//   '.jpg': true,
//   '.jpeg': true,
//   '.gif': true,
//   '.svg': true,
//   '.ico': true
// }

// const middleware = proxy(function(pathname, req) {
//   const { url, method, headers } = req
//   if (url.startsWith('/browser-sync')) {
//     return false;
//   }
//   if (url.indexOf('channel_page') >= 0) {
//     return false;
//   }
//   if (url.indexOf('/m') >= 0) {
//     return false;
//   }
//   // if (url.indexOf('/common') >= 0) {
//   //   return false;
//   // }
//   // if (url.indexOf('/third') >= 0) {
//   //   return false;
//   // }
//   const { accept } = headers
//   const { ext } = path.parse(url);
//   // if (accept && accept.indexOf('text/html') >= 0) {
//   //   return false;
//   // }
//   if (method.toLowerCase() === 'get' && blackMenu[ext + '']) {
//     return false;
//   }
//   console.log(pathname, '启动代理')
//   return true;
// }, {
//   // target: 'http://test.gs.zufangzi.com', //'https://api.github.com',
//   target: 'http://testm.gs.lianjia.zufangzi.com:8100',
//   changeOrigin: true,
//   logLevel: 'debug'
// });
