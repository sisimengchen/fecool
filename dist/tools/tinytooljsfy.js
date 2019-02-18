"use strict";

/**
 * @file 把目录下所有.js文件顶部增加 babel-plugin-tinytool 可编译的注释
 * @author mengchen <mengchen002@ke.com>
 * @module tools/tinytooljsfy
 */
var fs = require("fs");

var path = require("path");

var filePath = path.resolve("./m/src"); // 调用文件遍历方法

fileDisplay(filePath);
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */

function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach(function (filename) {
        //获取当前文件的绝对路径
        var filedir = path.join(filePath, filename); //根据文件路径获取文件信息，返回一个fs.Stats对象

        fs.stat(filedir, function (eror, stats) {
          if (eror) {
            console.warn("获取文件stats失败");
          } else {
            var isFile = stats.isFile(); //是文件

            var isDir = stats.isDirectory(); //是文件夹

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
              fileDisplay(filedir); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        });
      });
    }
  });
}