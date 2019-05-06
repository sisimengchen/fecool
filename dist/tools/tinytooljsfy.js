"use strict";

var fs = require("fs");

var path = require("path");

var filePath = path.resolve("./m/src");
fileDisplay(filePath);

function fileDisplay(filePath) {
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err);
    } else {
      files.forEach(function (filename) {
        var filedir = path.join(filePath, filename);
        fs.stat(filedir, function (eror, stats) {
          if (eror) {
            console.warn("获取文件stats失败");
          } else {
            var isFile = stats.isFile();
            var isDir = stats.isDirectory();

            if (isFile) {
              if (path.extname(filedir) === ".js") {
                console.log(filedir);
                fs.readFile(filedir, "utf8", function (err, data) {
                  if (err) throw err;
                  var newContent = "/* @tinytooljs */\n" + data;
                  fs.writeFile(filedir, newContent, "utf8", function (err) {
                    if (err) throw err;
                    console.log("success done");
                  });
                });
              }
            }

            if (isDir) {
              fileDisplay(filedir);
            }
          }
        });
      });
    }
  });
}