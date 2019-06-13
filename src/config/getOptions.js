/**
 * @file 配置生成器
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const path = require("path");
const resolve = require("resolve");
const hasha = require("hasha");
const {
  isURL,
  isDataURI,
  isPath,
  isDirectory,
  isRelativePath,
  printer,
  extname
} = require("../util");

const codeExt = [
  ".less",
  ".css",
  ".styl",
  ".js",
  ".jsx",
  ".html",
  ".ejs",
  ".php",
  ".phtml"
];

class Options {
  constructor(options = {}) {
    this.__options = options;
    this.init(options);
  }

  init(options) {
    const {
      entry = {},
      output = {},
      resolve = {},
      optimization = {}
    } = this.__options;
    this.mode = options.mode ? options.mode : "production";
    this.context = path.isAbsolute(options.context)
      ? options.context
      : path.join(process.cwd(), options.context);
    this.sourceDir = path.isAbsolute(entry.path)
      ? entry.path
      : path.join(this.context, entry.path);
    this.commonDir = path.isAbsolute(entry.common)
      ? entry.common
      : path.join(this.context, entry.common);
    this.exclude = (entry.exclude || []).map((excludePath, index) => {
      return path.isAbsolute(excludePath)
        ? excludePath
        : path.join(this.context, excludePath);
    });
    this.tinytooljs = entry.tinytooljs || false;
    this.distDir = path.isAbsolute(output.path)
      ? output.path
      : path.join(this.context, output.path);
    this.distCommonDir = path.isAbsolute(output.common)
      ? output.common
      : path.join(this.context, output.common);
    this.publicPath = output.publicPath;
    this.sourceMapDirName = "./.sourcemaps";
    this.alias = {};
    Object.keys(resolve.alias).forEach((item, index) => {
      this.isAliasOn = true;
      const alia = resolve.alias[item];
      this.alias[item] = path.isAbsolute(alia)
        ? alia
        : path.join(this.context, alia);
    });
    this.moduleDirectory = this.__options.moduleDirectory || [];
    this.imagemin = optimization.imagemin || this.__options.imagemin || false;
    this.retainExtname =
      optimization.retainExtname || this.__options.retainExtname || false;
    this.timestamp = output.timestamp || this.__options.timestamp;
    this.buildTimestamp = this.timestamp || +new Date();
    this.hasha = output.hasha || this.__options.hasha || false;
    this.args = output.args || this.__options.args || {};
    this.ignoreExt = output.ignoreExt || [];
    this.envCode = undefined;
  }

  getIgnoreMove() {
    let list1 = codeExt.map(item => {
      return item.slice(1);
    });
    let list2 = this.ignoreExt.map(item => {
      return item.slice(1);
    });
    const list = list1.concat(list2);
    return `{${list.join(",")}}`;
  }

  getCommonModuleOutput() {
    return this.mapEntry2Output(path.join(this.distCommonDir, "commonmodule.js"));
  }

  /**
   * [判断是否开启debug]
   * @return {[Boolean]}           [是否开启debug]
   */
  isDebug() {
    return !!this.__options.debug;
  }

  /**
   * [判断是否开启监听]
   * @return {[Boolean]}           [是否开启监听]
   */
  isWatch() {
    return !!this.__options.watch;
  }

  /**
   * [判断是否开发者模式]
   * @return {[Boolean]}           [是否开发者模式]
   */
  isDevelopENV() {
    return this.mode === "development";
  }

  /**
   * [判断是否是ModuleDirectory]
   * @param {*} path
   */
  isModuleDirectory(path) {
    if (!path) return false;
    const length = this.moduleDirectory.length;
    for (let i = 0; i < length; i++) {
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
  mapEntry2Output(src) {
    return src.replace(this.sourceDir, this.distDir);
  }

  /**
   * [根据条件生成gulp的Vinyl] https://github.com/gulpjs/vinyl
   * @param {*} includes 包括的文件后缀
   * @param {*} excludes 不包括的文件后缀
   * @param {*} excludeCommon 是否包含common目录
   */
  getGulpSrc(includes = "*", excludes = false, excludeCommon = false) {
    const vfs = [];
    vfs.push(path.resolve(this.sourceDir, "**", `*.${includes}`));
    if (excludes) {
      excludes = path.resolve(this.sourceDir, "**", `*.${excludes}`);
      vfs.push(`!${excludes}`);
    }
    if (this.exclude.length) {
      this.exclude.forEach(excludePath => {
        if (isDirectory(excludePath)) {
          excludePath = path.resolve(excludePath, "**", `*.*`);
        }
        vfs.push(`!${excludePath}`);
      });
    }
    if (excludeCommon) {
      excludeCommon = path.resolve(this.commonDir, "**", `*.${includes}`);
      vfs.push(`!${excludeCommon}`);
    }
    return vfs;
  }

  /**
   *
   * @param {*} includes 包括的文件后缀
   * @param {*} excludes 不包括的文件后缀
   */
  getCommonSrc(includes = "*", excludes = false) {
    const vfs = [];
    includes = path.resolve(this.commonDir, "**", `*.${includes}`);
    vfs.push(includes);
    this.exclude.forEach(excludePath => {
      if (isDirectory(excludePath)) {
        excludePath = path.resolve(excludePath, "**", `*.*`);
      }
      vfs.push(`!${excludePath}`);
    });
    if (this.exclude.length) {
      this.exclude.forEach(excludePath => {
        excludePath = path.resolve(excludePath, "**", `*.*`);
        vfs.push(`!${excludePath}`);
      });
    }
    return vfs;
  }

  getExcludeSrc() {
    const vfs = [];
    if (this.exclude.length) {
      this.exclude.forEach(excludePath => {
        if (isDirectory(excludePath)) {
          excludePath = path.resolve(excludePath, "**", `*.*`);
        }
        vfs.push(excludePath);
      });
    }
    return vfs;
  }

  getExcludeDest() {
    const vfs = [];
    if (this.exclude.length) {
      this.exclude.forEach(excludePath => {
        vfs.push(this.mapEntry2Output(excludePath));
      });
    }
    return vfs;
  }

  /**
   * 获取common目录
   */
  getCommonDest() {
    return this.distCommonDir;
  }

  getGulpSrc4Dest(includes) {
    const vfs = [];
    includes = path.resolve(this.distDir, "**", `*.${includes}`);
    vfs.push(includes);
    return vfs;
  }

  getGulpCommon4Dest(includes) {
    const vfs = [];
    includes = path.resolve(this.distCommonDir, "**", `*.${includes}`);
    vfs.push(includes);
    return vfs;
  }

  getGulpDest() {
    return this.distDir;
  }

  /**
   * [根据资源绝对路径获取编译后的url]
   * @param  {[String]} source    [资源绝对路径]
   * @return {[String]}           [资源编译后的url]
   */
  getURL(source = "nosource", timestamp) {
    let url;
    if (isURL(source)) {
      url = source;
    } else if (isDataURI(source)) {
      url = source;
    } else if (isPath(source)) {
      url = `${this.publicPath}/${path.relative(this.sourceDir, source)}${
        timestamp ? `?v=${timestamp}` : ""
      }`;
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
  resolve(source, filename) {
    let resourcePath;
    if (isURL(source)) {
      resourcePath = source;
    } else if (isDataURI(source)) {
      resourcePath = source;
    } else {
      const normalizedPath = this.normalize(source, filename); // normalize化
      try {
        // 利用 browserify/resolve（ https://github.com/browserify/resolve ) 进行寻路
        resourcePath = resolve.sync(normalizedPath, {
          moduleDirectory: this.moduleDirectory,
          basedir: path.dirname(filename),
          extensions: [".js", ".jsx"]
        });
      } catch (e) {
        printer.warn(
          "路径解析失败，恢复原路径",
          "filename:",
          filename,
          "source:",
          source
        );
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
  normalize(source, filename) {
    // 判断是否匹配到了alias规则，如果匹配了，则进行规范处理
    if (this.isAliasOn && source && isPath(source) && isRelativePath(source)) {
      // 如果source是一个相对路径，并且开启了alias
      const pathList = source.split("/");
      if (pathList.length === 0) return source;
      const aliasKey = pathList[0];
      const aliasPath = this.alias[aliasKey + ""];
      if (!aliasPath) return source;
      pathList.shift();
      source = path.resolve(aliasPath, `${pathList.join("/")}`);
      let relative = path.relative(path.dirname(filename), source);
      // let relative = path.relative(path.dirname(filename), source);
      return `./${relative}`;
    }
    return source;
  }

  /**
   * [根据文件名获取模块信息]
   * @param  {[String]} filename   [文件名]
   * @param  {[String]} supplyExt  [强制后缀名]
   * @return {[String]}            [模块信息]
   */
  getModule(filename, supplyExt) {
    if (!filename) return undefined;
    if (isURL(filename)) {
      return {
        filename,
        url: filename
      };
    }
    let hashCode = this.isDevelopENV() ? "" : this.getHashaCode(filename);
    let timestamp = this.timestamp;
    const ext = path.extname(filename);
    // 先把这些的hash干掉，这里以后需要做规划
    if (codeExt.indexOf(ext.toLocaleLowerCase()) > -1) {
      hashCode = "";
      timestamp = "";
    }
    let transformFilename = this.getTransformFilename(
      filename,
      hashCode,
      supplyExt
    );
    const module = {
      filename, // 源文件名
      hashCode, // 源文件名hashcode
      transformFilename, // 转换文件名（基础路径还是在源文件路径下，不会真实落入文件系统）
      distFilename: this.mapEntry2Output(transformFilename), // 目标文件名
      distFilenameRaw: this.mapEntry2Output(
        this.getTransformFilename(filename, hashCode)
      ), // 目标文件名不会被supplyExt影响
      url: this.getURL(transformFilename, timestamp) // 资源url
    };
    printer.debug("模块解析", filename, "==>", module);
    return module;
  }

  /**
   * [获取转换后的文件名]
   * @param  {[String]} filename   [文件名]
   * @param  {[String]} hashCode   [hashcode]
   * @param  {[String]} supplyExt  [强制后缀名]
   * @return {[String]}            [规范后的依赖值]
   */
  getTransformFilename(filename, hashCode, supplyExt) {
    if (!filename) return undefined;
    if (supplyExt) {
      if (hashCode) {
        filename = `${filename}.${hashCode}${supplyExt}`;
      } else {
        filename = `${filename}${supplyExt}`;
      }
    } else {
      let ext = path.extname(filename);
      if (ext === ".jsx") {
        // .jsx ==> .jsx.js
        ext = this.retainExtname ? `${ext}.js` : ".js";
      } else if (ext === ".less" || ext === ".styl") {
        // .less|.styl ==> .less|.styl.css
        ext = this.retainExtname ? `${ext}.css` : ".css";
      }
      if (hashCode) {
        filename = extname(filename, `.${hashCode}${ext}`);
      } else {
        filename = extname(filename, ext);
      }
    }
    return filename;
  }

  /**
   * 获取文件hashcode
   * @param {*} filename
   */
  getHashaCode(filename) {
    if (!filename) return;
    if (!this.hasha) return "";
    return hasha.fromFileSync(filename, {
      algorithm: "md5"
    }); // 生成hashcode
  }

  getEnvCode() {
    if (!this.envCode) {
      const { template } = require("@babel/core");
      const generate = require("@babel/generator").default;
      const codeWrapper = template(`window.__args = JSON.parse('VALUE');`);
      const args = {
        ...this.args,
        buildTimestamp: this.buildTimestamp,
        env: this.mode
      };
      const ast = codeWrapper({
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
  server() {
    const { server } = this.__options;
    this.server = Object.assign({}, server);
    this.server.server = this.server.server || {};
    this.server.server.baseDir = this.distDir;
    this.server.files = this.server.files || [
      path.resolve(this.distDir, "**", `*.*`)
    ];
    this.server.middleware = this.server.middleware || [];
    this.server.middleware = this.server.middleware
      .map((item, index) => {
        let middleware, options;
        if (Object.prototype.toString.call(item) === "[object Array]") {
          [middleware, options = {}] = item;
        } else {
          middleware = item;
        }
        if (Object.prototype.toString.call(middleware) == "[object String]") {
          try {
            middleware = require(`../middlewares/${middleware}`)(options);
          } catch (error) {
            printer.error(error);
            middleware = false;
          } finally {
          }
        }
        return middleware;
      })
      .filter(Boolean);
    this.server.middleware.unshift(require("../middlewares/connect-logger")());
    return this.server;
  }
}

let instance;

const getOptions = function(userOptions = {}) {
  if (instance) {
    return instance;
  } else {
    const options = Object.assign(
      {},
      require("./defaultOptions.js"),
      userOptions
    );
    printer.debug("启动配置", options);
    instance = new Options(options);
    return instance;
  }
};

const KEYWORD = "url";

getOptions.urlReg = new RegExp(
  `['"\\(]\\s*([\\w\\_\\/\\.\\-]+\\#${KEYWORD})\\s*['"\\)]`,
  "gi"
);

module.exports = getOptions;
