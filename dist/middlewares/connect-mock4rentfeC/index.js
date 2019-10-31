"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
  var viewRendererSimulatorFileName = path.resolve(options.simulatorDirName, "./ViewRendererSimulator.php");
  var commonMockFileName = path.resolve(options.simulatorDirName, "./mock_base.json");
  var defaultMockFileName = path.resolve(options.simulatorDirName, "./mock_default.json");
  var templateFileName = path.resolve(options.simulatorDirName, "./template.php");
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
    var pathname = req._parsedUrl.pathname;
    var search = req._parsedUrl.search;

    var _path$parse = path.parse(pathname),
        ext = _path$parse.ext,
        base = _path$parse.base,
        name = _path$parse.name;

    if (ext && ext.toLocaleLowerCase() === ".phtml") {
      var fileName = path.join(globalOptions.distDir, pathname);

      if (!fs.existsSync(fileName)) {
        next();
        return;
      }

      var mockFileName = path.join(fileName, "../".concat(name, ".mock.json"));
      var mockFileNameAlternate = path.join(fileName, "../mock.json");

      if (!fs.existsSync(mockFileName)) {
        if (!fs.existsSync(mockFileNameAlternate)) {
          mockFileName = defaultMockFileName;
        } else {
          mockFileName = mockFileNameAlternate;
        }
      }

      ejs.renderFile(templateFileName, {
        commonMockFileName: commonMockFileName,
        mockFileName: mockFileName,
        viewRendererSimulatorFileName: viewRendererSimulatorFileName,
        mainlayoutFileName: options.mainlayoutFileName,
        fileName: fileName
      }, options, function (error, codes) {
        if (error) {
          printer.error(error);
          res.end(error.toString());
          return;
        }

        var outPath = path.join(fileName, "../".concat(name).concat(+new Date(), ".php"));
        fs.writeFile(outPath, codes, "utf8", function (error) {
          if (error) {
            printer.error(error);
            res.end(error.toString());
            return;
          }

          var target = "".concat(options.phpServerUrl, "/").concat(path.relative(globalOptions.distDir, outPath)).concat(search ? search : "");
          var proxy = new HttpProxy();
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