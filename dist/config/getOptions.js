"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var path = require("path");

var _resolve = require("resolve");

var hasha = require("hasha");

var _require = require("../util"),
    isURL = _require.isURL,
    isDataURI = _require.isDataURI,
    isPath = _require.isPath,
    isDirectory = _require.isDirectory,
    isRelativePath = _require.isRelativePath,
    printer = _require.printer,
    extname = _require.extname;

var codeExt = [".less", ".css", ".styl", ".js", ".jsx", ".html", ".ejs", ".php", ".phtml"];

var Options = function () {
  function Options() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Options);

    this.__options = options;
    this.init(options);
  }

  _createClass(Options, [{
    key: "init",
    value: function init(options) {
      var _this = this;

      var _this$__options = this.__options,
          _this$__options$entry = _this$__options.entry,
          entry = _this$__options$entry === void 0 ? {} : _this$__options$entry,
          _this$__options$outpu = _this$__options.output,
          output = _this$__options$outpu === void 0 ? {} : _this$__options$outpu,
          _this$__options$resol = _this$__options.resolve,
          resolve = _this$__options$resol === void 0 ? {} : _this$__options$resol,
          _this$__options$optim = _this$__options.optimization,
          optimization = _this$__options$optim === void 0 ? {} : _this$__options$optim;
      this.mode = options.mode ? options.mode : "production";
      this.context = path.isAbsolute(options.context) ? options.context : path.join(process.cwd(), options.context);
      this.sourceDir = path.isAbsolute(entry.path) ? entry.path : path.join(this.context, entry.path);
      this.commonDir = path.isAbsolute(entry.common) ? entry.common : path.join(this.context, entry.common);
      this.exclude = (entry.exclude || []).map(function (excludePath, index) {
        return path.isAbsolute(excludePath) ? excludePath : path.join(_this.context, excludePath);
      });
      this.tinytooljs = entry.tinytooljs || false;
      this.distDir = path.isAbsolute(output.path) ? output.path : path.join(this.context, output.path);
      this.distCommonDir = path.isAbsolute(output.common) ? output.common : path.join(this.context, output.common);
      this.publicPath = output.publicPath;
      this.sourceMapDirName = "./.sourcemaps";
      this.alias = {};
      Object.keys(resolve.alias).forEach(function (item, index) {
        _this.isAliasOn = true;
        var alia = resolve.alias[item];
        _this.alias[item] = path.isAbsolute(alia) ? alia : path.join(_this.context, alia);
      });
      this.moduleDirectory = this.__options.moduleDirectory || [];
      this.imagemin = optimization.imagemin || this.__options.imagemin || false;
      this.retainExtname = optimization.retainExtname || this.__options.retainExtname || false;
      this.timestamp = output.timestamp || this.__options.timestamp;
      this.buildTimestamp = this.timestamp || +new Date();
      this.hasha = output.hasha || this.__options.hasha || false;
      this.args = output.args || this.__options.args || {};
      this.ignoreExt = output.ignoreExt || [];
      this.envCode = undefined;
    }
  }, {
    key: "getIgnoreMove",
    value: function getIgnoreMove() {
      var list1 = codeExt.map(function (item) {
        return item.slice(1);
      });
      var list2 = this.ignoreExt.map(function (item) {
        return item.slice(1);
      });
      var list = list1.concat(list2);
      return "{".concat(list.join(","), "}");
    }
  }, {
    key: "getCommonModuleOutput",
    value: function getCommonModuleOutput() {
      return this.mapEntry2Output(path.join(this.distCommonDir, "commonmodule.js"));
    }
  }, {
    key: "isDebug",
    value: function isDebug() {
      return !!this.__options.debug;
    }
  }, {
    key: "isWatch",
    value: function isWatch() {
      return !!this.__options.watch;
    }
  }, {
    key: "isDevelopENV",
    value: function isDevelopENV() {
      return this.mode === "development";
    }
  }, {
    key: "isModuleDirectory",
    value: function isModuleDirectory(path) {
      if (!path) return false;
      var length = this.moduleDirectory.length;

      for (var i = 0; i < length; i++) {
        if (path.includes(this.moduleDirectory[i])) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "mapEntry2Output",
    value: function mapEntry2Output(src) {
      return src.replace(this.sourceDir, this.distDir);
    }
  }, {
    key: "getGulpSrc",
    value: function getGulpSrc() {
      var includes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
      var excludes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var excludeCommon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var vfs = [];
      vfs.push(path.resolve(this.sourceDir, "**", "*.".concat(includes)));

      if (excludes) {
        excludes = path.resolve(this.sourceDir, "**", "*.".concat(excludes));
        vfs.push("!".concat(excludes));
      }

      if (this.exclude.length) {
        this.exclude.forEach(function (excludePath) {
          if (isDirectory(excludePath)) {
            excludePath = path.resolve(excludePath, "**", "*.*");
          }

          vfs.push("!".concat(excludePath));
        });
      }

      if (excludeCommon) {
        excludeCommon = path.resolve(this.commonDir, "**", "*.".concat(includes));
        vfs.push("!".concat(excludeCommon));
      }

      return vfs;
    }
  }, {
    key: "getCommonSrc",
    value: function getCommonSrc() {
      var includes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
      var excludes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var vfs = [];
      includes = path.resolve(this.commonDir, "**", "*.".concat(includes));
      vfs.push(includes);
      this.exclude.forEach(function (excludePath) {
        if (isDirectory(excludePath)) {
          excludePath = path.resolve(excludePath, "**", "*.*");
        }

        vfs.push("!".concat(excludePath));
      });

      if (this.exclude.length) {
        this.exclude.forEach(function (excludePath) {
          excludePath = path.resolve(excludePath, "**", "*.*");
          vfs.push("!".concat(excludePath));
        });
      }

      return vfs;
    }
  }, {
    key: "getExcludeSrc",
    value: function getExcludeSrc() {
      var vfs = [];

      if (this.exclude.length) {
        this.exclude.forEach(function (excludePath) {
          if (isDirectory(excludePath)) {
            excludePath = path.resolve(excludePath, "**", "*.*");
          }

          vfs.push(excludePath);
        });
      }

      return vfs;
    }
  }, {
    key: "getExcludeDest",
    value: function getExcludeDest() {
      var _this2 = this;

      var vfs = [];

      if (this.exclude.length) {
        this.exclude.forEach(function (excludePath) {
          vfs.push(_this2.mapEntry2Output(excludePath));
        });
      }

      return vfs;
    }
  }, {
    key: "getCommonDest",
    value: function getCommonDest() {
      return this.distCommonDir;
    }
  }, {
    key: "getGulpSrc4Dest",
    value: function getGulpSrc4Dest(includes) {
      var vfs = [];
      includes = path.resolve(this.distDir, "**", "*.".concat(includes));
      vfs.push(includes);
      return vfs;
    }
  }, {
    key: "getGulpCommon4Dest",
    value: function getGulpCommon4Dest(includes) {
      var vfs = [];
      includes = path.resolve(this.distCommonDir, "**", "*.".concat(includes));
      vfs.push(includes);
      return vfs;
    }
  }, {
    key: "getGulpDest",
    value: function getGulpDest() {
      return this.distDir;
    }
  }, {
    key: "getURL",
    value: function getURL() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nosource";
      var timestamp = arguments.length > 1 ? arguments[1] : undefined;
      var url;

      if (isURL(source)) {
        url = source;
      } else if (isDataURI(source)) {
        url = source;
      } else if (isPath(source)) {
        url = "".concat(this.publicPath, "/").concat(path.relative(this.sourceDir, source)).concat(timestamp ? "?v=".concat(timestamp) : "");
      } else {
        url = source;
      }

      printer.debug("获取URL", source, "==>", url);
      return url;
    }
  }, {
    key: "resolve",
    value: function resolve(source, filename) {
      var resourcePath;

      if (isURL(source)) {
        resourcePath = source;
      } else if (isDataURI(source)) {
        resourcePath = source;
      } else {
        var normalizedPath = this.normalize(source, filename);

        try {
          resourcePath = _resolve.sync(normalizedPath, {
            moduleDirectory: this.moduleDirectory,
            basedir: path.dirname(filename),
            extensions: [".js", ".jsx"]
          });
        } catch (e) {
          printer.warn("路径解析失败，恢复原路径", "filename:", filename, "source:", source);
          resourcePath = source;
        }
      }

      printer.debug("路径解析", filename, source, "==>", resourcePath);
      return resourcePath;
    }
  }, {
    key: "normalize",
    value: function normalize(source, filename) {
      if (this.isAliasOn && source && isPath(source) && isRelativePath(source)) {
        var pathList = source.split("/");
        if (pathList.length === 0) return source;
        var aliasKey = pathList[0];
        var aliasPath = this.alias[aliasKey + ""];
        if (!aliasPath) return source;
        pathList.shift();
        source = path.resolve(aliasPath, "".concat(pathList.join("/")));
        var relative = path.relative(path.dirname(filename), source);
        return "./".concat(relative);
      }

      return source;
    }
  }, {
    key: "getModule",
    value: function getModule(filename, supplyExt) {
      if (!filename) return undefined;

      if (isURL(filename)) {
        return {
          filename: filename,
          url: filename
        };
      }

      var hashCode = this.isDevelopENV() ? "" : this.getHashaCode(filename);
      var timestamp = this.timestamp;
      var ext = path.extname(filename);

      if (codeExt.indexOf(ext.toLocaleLowerCase()) > -1) {
        hashCode = "";
        timestamp = "";
      }

      var transformFilename = this.getTransformFilename(filename, hashCode, supplyExt);
      var module = {
        filename: filename,
        hashCode: hashCode,
        transformFilename: transformFilename,
        distFilename: this.mapEntry2Output(transformFilename),
        distFilenameRaw: this.mapEntry2Output(this.getTransformFilename(filename, hashCode)),
        url: this.getURL(transformFilename, timestamp)
      };
      printer.debug("模块解析", filename, "==>", module);
      return module;
    }
  }, {
    key: "getTransformFilename",
    value: function getTransformFilename(filename, hashCode, supplyExt) {
      if (!filename) return undefined;

      if (supplyExt) {
        if (hashCode) {
          filename = "".concat(filename, ".").concat(hashCode).concat(supplyExt);
        } else {
          filename = "".concat(filename).concat(supplyExt);
        }
      } else {
        var ext = path.extname(filename);

        if (ext === ".jsx") {
          ext = this.retainExtname ? "".concat(ext, ".js") : ".js";
        } else if (ext === ".less" || ext === ".styl") {
          ext = this.retainExtname ? "".concat(ext, ".css") : ".css";
        }

        if (hashCode) {
          filename = extname(filename, ".".concat(hashCode).concat(ext));
        } else {
          filename = extname(filename, ext);
        }
      }

      return filename;
    }
  }, {
    key: "getHashaCode",
    value: function getHashaCode(filename) {
      if (!filename) return;
      if (!this.hasha) return "";
      return hasha.fromFileSync(filename, {
        algorithm: "md5"
      });
    }
  }, {
    key: "getEnvCode",
    value: function getEnvCode() {
      if (!this.envCode) {
        var _require2 = require("@babel/core"),
            template = _require2.template;

        var generate = require("@babel/generator")["default"];

        var codeWrapper = template("window.__args = JSON.parse('VALUE');");

        var args = _objectSpread({}, this.args, {
          buildTimestamp: this.buildTimestamp,
          env: this.mode
        });

        var ast = codeWrapper({
          VALUE: JSON.stringify(args),
          JSON: "JSON"
        });
        this.envCode = generate(ast).code;
      }

      return this.envCode;
    }
  }, {
    key: "server",
    value: function server() {
      var server = this.__options.server;
      this.server = Object.assign({}, server);
      this.server.server = this.server.server || {};
      this.server.server.baseDir = this.distDir;
      this.server.files = this.server.files || [path.resolve(this.distDir, "**", "*.*")];
      this.server.middleware = this.server.middleware || [];
      this.server.middleware = this.server.middleware.map(function (item, index) {
        var middleware, options;

        if (Object.prototype.toString.call(item) === "[object Array]") {
          var _item = _slicedToArray(item, 2);

          middleware = _item[0];
          var _item$ = _item[1];
          options = _item$ === void 0 ? {} : _item$;
        } else {
          middleware = item;
        }

        if (Object.prototype.toString.call(middleware) == "[object String]") {
          try {
            middleware = require("../middlewares/".concat(middleware))(options);
          } catch (error) {
            printer.error(error);
            middleware = false;
          } finally {}
        }

        return middleware;
      }).filter(Boolean);
      this.server.middleware.unshift(require("../middlewares/connect-logger")());
      return this.server;
    }
  }]);

  return Options;
}();

var instance;

var getOptions = function getOptions() {
  var userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (instance) {
    return instance;
  } else {
    var options = Object.assign({}, require("./defaultOptions.js"), userOptions);
    printer.debug("启动配置", options);
    instance = new Options(options);
    return instance;
  }
};

var KEYWORD = "url";
getOptions.urlReg = new RegExp("['\"\\(]\\s*([\\w\\_\\/\\.\\-]+\\#".concat(KEYWORD, ")\\s*['\"\\)]"), "gi");
module.exports = getOptions;