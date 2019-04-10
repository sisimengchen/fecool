"use strict";

var path = require("path");

var fs = require("fs");

var _require = require("child_process"),
    spawn = _require.spawn;

var _require2 = require("../../config"),
    getOptions = _require2.getOptions;

var hasha = require("hasha");

var _require3 = require("../../util"),
    printer = _require3.printer;

var globalOptions = getOptions();
var mockStr = fs.readFileSync(path.resolve(__dirname, "./mock.php"), "utf8") + "\n";

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (req, res, next) {
    var pathname = req._parsedUrl.pathname;
    var search = req._parsedUrl.search;

    var _path$parse = path.parse(pathname),
        ext = _path$parse.ext;

    if (ext && ext.toLocaleLowerCase() === ".php") {
      var fileName = path.join(globalOptions.distDir, pathname); // 获取要访问的文件

      var mockFilename = path.join(fileName, "../mock.phpjson");
      fs.readFile(fileName, "utf8", function (error, data) {
        if (error) {
          printer.error(error);
          res.end(error.toString());
          throw error;
        } else {
          var hashacode = hasha.fromFileSync(fileName, {
            algorithm: "md5"
          }).substr(0, 8);
          var outPath = fileName + hashacode;
          var newContent = mockStr.replace(/\$MOCK_PATH\$/g, mockFilename).replace(/\$MOCK_TIMESTAMP\$/g, "$_data" + hashacode) + data;
          fs.writeFile(outPath, newContent, "utf8", function (error) {
            if (error) {
              printer.error(error);
              res.end(error.toString());
              throw error;
            } else {
              var php = spawn("php", ["-f", outPath]);
              php.stdout.on("data", function (data) {
                console.log(data.toString());
                res.end(data.toString());
              });
              php.stderr.on("data", function (error) {
                printer.error(error.toString());
                res.end(data.toString());
              });
              php.on("close", function (code) {
                fs.unlinkSync(outPath);
              });
            }
          });
        }
      });
    } else {
      next();
    }
  };
};