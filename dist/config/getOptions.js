"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

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
    isRelativePath = _require.isRelativePath,
    printer = _require.printer,
    extname = _require.extname;

var Options =
/*#__PURE__*/
function () {
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
          entry = _this$__options.entry,
          output = _this$__options.output,
          resolve = _this$__options.resolve;
      this.mode = options.mode ? options.mode : "production";
      this.context = path.isAbsolute(options.context) ? options.context : path.join(process.cwd(), options.context);
      this.sourceDir = path.isAbsolute(entry.path) ? entry.path : path.join(this.context, entry.path);
      this.commonDir = path.isAbsolute(entry.common) ? entry.common : path.join(this.context, entry.common);
      this.distDir = path.isAbsolute(output.path) ? output.path : path.join(this.context, output.path);
      this.distCommonDir = path.isAbsolute(output.common) ? output.common : path.join(this.context, output.common);
      this.publicPath = output.publicPath;
      this.sourceMapDirname = "./.sourcemaps";
      this.alias = {};
      Object.keys(resolve.alias).forEach(function (item, index) {
        _this.isAliasOn = true;
        var alia = resolve.alias[item];
        _this.alias[item] = path.isAbsolute(alia) ? alia : path.join(_this.context, alia);
      });
      this.moduleDirectory = this.__options.moduleDirectory || [];
      this.timestamp = this.__options.timestamp;
      this.buildTimestamp = this.timestamp || +new Date();
      this.args = this.__options.args || {};
      this.envCode = undefined;
    }
    /**
     * [判断是否开启debug]
     * @return {[Boolean]}           [是否开启debug]
     */

  }, {
    key: "isDebug",
    value: function isDebug() {
      return !!this.__options.debug;
    }
    /**
     * [判断是否开启监听]
     * @return {[Boolean]}           [是否开启监听]
     */

  }, {
    key: "isWatch",
    value: function isWatch() {
      return !!this.__options.watch;
    }
    /**
     * [判断是否开发者模式]
     * @return {[Boolean]}           [是否开发者模式]
     */

  }, {
    key: "isDevelopENV",
    value: function isDevelopENV() {
      return this.mode === "development";
    }
    /**
     * [判断是否是ModuleDirectory]
     * @param {*} path
     */

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
    /**
     * [输入路径到输入路径路径映射]
     * @param {*} src
     */

  }, {
    key: "mapEntry2Output",
    value: function mapEntry2Output(src) {
      return src.replace(this.sourceDir, this.distDir);
    }
    /**
     * [根据条件生成gulp的Vinyl] https://github.com/gulpjs/vinyl
     * @param {*} includes 包括的文件后缀
     * @param {*} excludes 不包括的文件后缀
     * @param {*} excludeCommon 是否包含common目录
     */

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

      if (excludeCommon) {
        excludeCommon = path.resolve(this.commonDir, "**", "*.".concat(includes));
        vfs.push("!".concat(excludeCommon));
      }

      return vfs;
    }
    /**
     *
     * @param {*} includes 包括的文件后缀
     * @param {*} excludes 不包括的文件后缀
     */

  }, {
    key: "getCommonSrc",
    value: function getCommonSrc() {
      var includes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
      var excludes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var vfs = [];
      includes = path.resolve(this.commonDir, "**", "*.".concat(includes));
      vfs.push(includes);

      if (excludes) {
        excludes = path.resolve(this.commonDir, "**", "*.".concat(excludes));
        vfs.push("!".concat(excludes));
      }

      return vfs;
    }
    /**
     * 获取common目录
     */

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
    /**
     * [根据资源绝对路径获取编译后的url]
     * @param  {[String]} source    [资源绝对路径]
     * @return {[String]}           [资源编译后的url]
     */

  }, {
    key: "getURL",
    value: function getURL() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nosource";
      var url;

      if (isURL(source)) {
        url = source;
      } else if (isDataURI(source)) {
        url = source;
      } else if (isPath(source)) {
        url = "".concat(this.publicPath, "/").concat(path.relative(this.sourceDir, source)).concat(this.timestamp ? "?v=".concat(this.timestamp) : "");
      } else {
        url = source;
      }

      printer.debug("获取URL", source, "==>", url);
      return url;
    }
    /**
     * [根据基准文件路径+资源相对路径找到资源具觉得路径]
     * @param  {[String]} source    [资源相对路径]
     * @param  {[String]} filename   [基准文件路径]
     * @return {[String]}           [依赖资源具体所在的文件路径]
     */

  }, {
    key: "resolve",
    value: function resolve(source, filename) {
      var resourcePath;

      if (isURL(source)) {
        resourcePath = source;
      } else if (isDataURI(source)) {
        resourcePath = source;
      } else {
        var normalizedPath = this.normalize(source, filename); // normalize化

        try {
          // 利用 browserify/resolve（ https://github.com/browserify/resolve ) 进行寻路
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
    /**
     * [依赖描述规范化]
     * @param  {[String]} source    [依赖值]
     * @param  {[String]} filename  [依赖文件的绝对路径]
     * @return {[String]}           [规范后的依赖值]
     */

  }, {
    key: "normalize",
    value: function normalize(source, filename) {
      // 判断是否匹配到了alias规则，如果匹配了，则进行规范处理
      if (this.isAliasOn && source && isPath(source) && isRelativePath(source)) {
        // 如果source是一个相对路径，并且开启了alias
        var pathList = source.split("/");
        if (pathList.length === 0) return source;
        var aliasKey = pathList[0];
        var aliasPath = this.alias[aliasKey + ""];
        if (!aliasPath) return source;
        pathList.shift();
        source = path.resolve(aliasPath, "".concat(pathList.join("/")));
        var relative = path.relative(path.dirname(filename), source); // let relative = path.relative(path.dirname(filename), source);

        return "./".concat(relative);
      }

      return source;
    }
    /**
     * 根据文件名获取模块信息
     * @param {*} filename
     */

  }, {
    key: "getModule",
    value: function getModule(filename) {
      if (!filename) return undefined; // console.log(filename)

      var hashCode = this.isDevelopENV() ? "" : this.getHashaCode(filename); // hashCode = ""; // 暂时先禁用吧，这里可能还有待商榷

      var ext = path.extname(filename);

      if ([".less", ".css", ".styl", ".js", ".jsx", ".html"].indexOf(ext.toLocaleLowerCase()) > -1) {
        hashCode = "";
      }

      var transformFilename = this.getTransformFilename(filename, hashCode);
      var module = {
        filename: filename,
        hashCode: hashCode,
        transformFilename: transformFilename,
        distFilename: this.mapEntry2Output(transformFilename),
        url: this.getURL(transformFilename)
      };
      printer.debug("模块解析", filename, "==>", module);
      return module;
    }
  }, {
    key: "getTransformFilename",
    value: function getTransformFilename(filename, hashCode) {
      if (!filename) return undefined;
      var ext = path.extname(filename);

      if (ext === ".jsx") {
        ext = ".js";
      } else if (ext === ".less" || ext === ".styl") {
        ext = ".css";
      }

      if (hashCode) {
        filename = extname(filename, ".".concat(hashCode).concat(ext));
      } else {
        filename = extname(filename, ext);
      }

      return filename;
    }
  }, {
    key: "getHashaCode",
    value: function getHashaCode(filename) {
      if (!filename) return;
      return hasha.fromFileSync(filename, {
        algorithm: "md5"
      }); // 生成hashcode
    }
  }, {
    key: "getEnvCode",
    value: function getEnvCode() {
      if (!this.envCode) {
        var _require2 = require("@babel/core"),
            template = _require2.template;

        var generate = require("@babel/generator").default;

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
    /**
     * [服务配置获取]
     * @return {[object]}           [配置对象]
     */

  }, {
    key: "server",
    value: function server() {
      var _this$__options2 = this.__options,
          server = _this$__options2.server,
          template = _this$__options2.template;
      this.server = Object.assign({}, server);
      this.server.server = this.server.server || {};
      this.server.server.baseDir = this.distDir;
      this.server.files = this.server.files || [path.resolve(this.distDir, "**", "*.*")];
      this.server.middleware = this.server.middleware || [];
      this.server.middleware = [require("../middlewares/connect-logger")(), template && require("../middlewares/connect-mock4".concat(template))()].filter(Boolean).concat(this.server.middleware);
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