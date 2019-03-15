var babel = require("@babel/core");
var { getBabelOptions } = require("../src/config");
var fs = require("fs");

const ss = babel.transformFileSync(
  "./m/src/channel_page/ticket_index/index.js",
  getBabelOptions({
    isModule: false,
    isES6Enabled: true,
    isReactEnabled: false
  })
);

// console.log(ss.code);
fs.writeFile('./dist.js', ss.code,()=>{})
// const path = require("path");
// const resolve = require("resolve");

// const resourcePath = resolve.sync("react", {
//   moduleDirectory: ["common_modules", "node_modules"],
//   basedir: path.dirname("./m/src/channel_page/bd_index/index.js")
//   // extensions: [".js", ".jsx"]
// });

// console.log(resourcePath);
