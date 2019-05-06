const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { getOptions } = require("../../config");
const hasha = require("hasha");
const { printer } = require("../../util");

const globalOptions = getOptions();
const mockStr =
  fs.readFileSync(path.resolve(__dirname, "./mock.php"), "utf8") + "\n";

module.exports = function(options = {}) {
  return function(req, res, next) {
    const pathname = req._parsedUrl.pathname;
    const search = req._parsedUrl.search;
    const { ext } = path.parse(pathname);
    if (ext && ext.toLocaleLowerCase() === ".php") {
      const fileName = path.join(globalOptions.distDir, pathname); // 获取要访问的文件
      const mockFilename = path.join(fileName, "../mock.phpjson");
      fs.readFile(fileName, "utf8", (error, data) => {
        if (error) {
          printer.error(error);
          res.end(error.toString());
          throw error;
        } else {
          const hashacode = hasha
            .fromFileSync(fileName, {
              algorithm: "md5"
            })
            .substr(0, 8);
          const outPath = fileName + hashacode;
          const newContent =
            mockStr
              .replace(/\$MOCK_PATH\$/g, mockFilename)
              .replace(/\$MOCK_TIMESTAMP\$/g, "$_data" + hashacode) + data;
          fs.writeFile(outPath, newContent, "utf8", error => {
            if (error) {
              printer.error(error);
              res.end(error.toString());
              throw error;
            } else {
              const php = spawn("php", ["-f", outPath]);
              php.stdout.on("data", data => {
                console.log(data.toString());
                res.end(data.toString());
              });
              php.stderr.on("data", error => {
                printer.error(error.toString());
                res.end(data.toString());
              });
              php.on("close", code => {
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
