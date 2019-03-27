const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { getOptions } = require("../../config");
const hasha = require("hasha");
const {
  printer
} = require("../../util");

const globalOptions = getOptions();
const mockStr =
  fs.readFileSync(path.resolve(__dirname, "./mock.php"), "utf8") + "\n";

module.exports = function(options) {
  if (options == null) {
    options = {};
  }
  return function(req, res, next) {
    const { ext } = path.parse(req.url);
    if (ext && ext.toLocaleLowerCase() === ".php") {
      const codePath = path.join(globalOptions.distDir, req.url); // 获取要访问的文件
      const mockPath = path.join(codePath, "../mock.phpjson");
      fs.readFile(codePath, "utf8", (error, data) => {
        if (error) {
          printer.error(error);
          res.end(error.toString());
          throw error;
        } else {
          const hashacode = hasha
            .fromFileSync(codePath, {
              algorithm: "md5"
            })
            .substr(0, 8);
          const outPath = codePath + hashacode;
          const newContent =
            mockStr
              .replace(/\$MOCK_PATH\$/g, mockPath)
              .replace(/\$MOCK_TIMESTAMP\$/g, "$_data" + hashacode) + data;
          fs.writeFile(outPath, newContent, "utf8", error => {
            if (error) {
              printer.error(error);
              res.end(error.toString());
              throw error;
            } else {
              const php = spawn("php", ["-f", outPath]);
              php.stdout.on("data", data => {
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
