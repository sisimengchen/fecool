"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var path = require("path");

var fs = require("fs");

var _require = require("child_process"),
    spawn = _require.spawn;

var ejs = require("ejs");

var HttpProxy = require("http-proxy");

var _require2 = require("../../config"),
    getOptions = _require2.getOptions;

var _require3 = require("../../util"),
    printer = _require3.printer;

var globalOptions = getOptions();
var defaultOptions = {
  phpServer: {
    host: "127.0.0.1",
    port: 9527
  },
  simulatorDirName: "",
  mainlayoutFileName: ""
};

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  options = _objectSpread({
    defaultOptions: defaultOptions
  }, options);
  options.phpServerUrl = "http://".concat(options.phpServer.host, ":").concat(options.phpServer.port);
  options.simulatorDirName = path.isAbsolute(options.simulatorDirName) ? options.simulatorDirName : path.join(globalOptions.context, options.simulatorDirName);
  options.mainlayoutFileName = path.isAbsolute(options.mainlayoutFileName) ? options.mainlayoutFileName : path.join(globalOptions.context, options.mainlayoutFileName);
  options.mainlayoutFileName = globalOptions.mapEntry2Output(options.mainlayoutFileName);
  var viewRendererSimulatorFileName = path.resolve(options.simulatorDirName, "./ViewRendererSimulator.php"); // ViewRenderer 模拟类php路径

  var commonMockFileName = path.resolve(options.simulatorDirName, "./mock_base.json"); // 公共的mock文件

  var defaultMockFileName = path.resolve(options.simulatorDirName, "./mock_default.json"); // 默认的私有mock文件

  var templateFileName = path.resolve(options.simulatorDirName, "./template.php"); // 代码模板文件

  var phpServer = spawn("php", ["-S", "".concat(options.phpServer.host, ":").concat(options.phpServer.port), "-t", globalOptions.distDir]);
  phpServer.stdout.on("data", function (data) {
    printer.log(data.toString());
  });
  phpServer.stderr.on("data", function (error) {
    printer.error(error.toString());
  });
  phpServer.on("close", function (code) {
    printer.log("close");
  });
  return function (req, res, next) {
    var pathname = req._parsedUrl.pathname; // 获取访问的路径

    var search = req._parsedUrl.search;

    var _path$parse = path.parse(pathname),
        ext = _path$parse.ext,
        base = _path$parse.base,
        name = _path$parse.name; // ext => '.phtml'  base => 'xxx.phtml'


    if (ext && ext.toLocaleLowerCase() === ".phtml") {
      // 如果路径的扩展名是phtml则执行中间件
      var fileName = path.join(globalOptions.distDir, pathname); // 通过url获取要访问的文件

      if (!fs.existsSync(fileName)) {
        // 如果文件不存在则执行next()
        next();
        return;
      }

      var mockFileName = path.join(fileName, "../".concat(name, ".mock.json")); // 默认的mock文件路径

      var mockFileNameAlternate = path.join(fileName, "../mock.json"); // 替代的mock文件路径

      if (!fs.existsSync(mockFileName)) {
        if (!fs.existsSync(mockFileNameAlternate)) {
          // 如果两层mock都不存在则使用默认mock
          mockFileName = defaultMockFileName;
        } else {
          mockFileName = mockFileNameAlternate;
        }
      } // 最终生成的php路径


      ejs.renderFile(templateFileName, {
        commonMockFileName: commonMockFileName,
        // 公共的mock
        mockFileName: mockFileName,
        // 私有的的mock
        viewRendererSimulatorFileName: viewRendererSimulatorFileName,
        mainlayoutFileName: options.mainlayoutFileName,
        // php layout 模板
        fileName: fileName // php模板

      }, options, function (error, codes) {
        if (error) {
          printer.error(error);
          res.end(error.toString());
          return;
        }

        var outPath = path.join(fileName, "../".concat(name).concat(+new Date(), ".php")); // 最终生成的php路径
        // 生成代码

        fs.writeFile(outPath, codes, "utf8", function (error) {
          if (error) {
            printer.error(error);
            res.end(error.toString());
            return;
          }

          var target = "".concat(options.phpServerUrl, "/").concat(path.relative(globalOptions.distDir, outPath)).concat(search ? search : ""); // php服务的

          var proxy = new HttpProxy(); // 创建代理

          proxy.on("proxyRes", function (proxyRes, req, res) {
            proxyRes.on("end", function () {
              fs.unlinkSync(outPath);
              proxy.close();
            });
          });
          proxy.web(req, res, {
            target: target
          }, next);
        });
      });
    } else {
      next();
    }
  };
};