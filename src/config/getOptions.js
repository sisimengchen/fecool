const path = require("path");
const resolve = require("resolve");
const hasha = require("hasha");
const {
  isURL,
  isDataURI,
  isPath,
  isRelativePath,
  printer,
  extname
} = require("../util");

class Options {
  constructor(options = {}) {
    this.__options = options;
    this.init(options);
  }

  init(options) {
    const { entry, output, resolve } = this.__options;
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
    this.distDir = path.isAbsolute(output.path)
      ? output.path
      : path.join(this.context, output.path);
    this.distCommonDir = path.isAbsolute(output.common)
      ? output.common
      : path.join(this.context, output.common);
    this.publicPath = output.publicPath;
    this.sourceMapDirname = "./.sourcemaps";
    this.alias = {};
    Object.keys(resolve.alias).forEach((item, index) => {
      this.isAliasOn = true;
      const alia = resolve.alias[item];
      this.alias[item] = path.isAbsolute(alia)
        ? alia
        : path.join(this.context, alia);
    });
    this.moduleDirectory = this.__options.moduleDirectory || [];
    this.imagemin = this.__options.imagemin || false;
    this.timestamp = this.__options.timestamp;
    this.buildTimestamp = this.timestamp || +new Date();
    this.hasha = this.__options.hasha;
    this.args = this.__options.args || {};
    this.envCode = undefined;
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
    if (excludes) {
      excludes = path.resolve(this.commonDir, "**", `*.${excludes}`);
      vfs.push(`!${excludes}`);
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
  getURL(source = "nosource") {
    let url;
    if (isURL(source)) {
      url = source;
    } else if (isDataURI(source)) {
      url = source;
    } else if (isPath(source)) {
      url = `${this.publicPath}/${path.relative(this.sourceDir, source)}${
        this.timestamp ? `?v=${this.timestamp}` : ""
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
   * 根据文件名获取模块信息
   * @param {*} filename
   */
  getModule(filename) {
    if (!filename) return undefined;
    if (isURL(filename)) {
      return {
        filename,
        url: filename
      };
    }
    // console.log(filename)
    let hashCode = this.isDevelopENV() ? "" : this.getHashaCode(filename);
    // hashCode = ""; // 暂时先禁用吧，这里可能还有待商榷
    const ext = path.extname(filename);
    if (
      [".less", ".css", ".styl", ".js", ".jsx", ".html"].indexOf(
        ext.toLocaleLowerCase()
      ) > -1
    ) {
      hashCode = "";
    }
    let transformFilename = this.getTransformFilename(filename, hashCode);
    const module = {
      filename,
      hashCode,
      transformFilename,
      distFilename: this.mapEntry2Output(transformFilename),
      url: this.getURL(transformFilename)
    };
    printer.debug("模块解析", filename, "==>", module);
    return module;
  }

  getTransformFilename(filename, hashCode) {
    if (!filename) return undefined;
    let ext = path.extname(filename);
    if (ext === ".jsx") {
      ext = ".js";
    } else if (ext === ".less" || ext === ".styl") {
      ext = ".css";
    }
    if (hashCode) {
      filename = extname(filename, `.${hashCode}${ext}`);
    } else {
      filename = extname(filename, ext);
    }
    return filename;
  }

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
    const { server, template } = this.__options;
    this.server = Object.assign({}, server);
    this.server.server = this.server.server || {};
    this.server.server.baseDir = this.distDir;
    this.server.files = this.server.files || [
      path.resolve(this.distDir, "**", `*.*`)
    ];
    this.server.middleware = this.server.middleware || [];
    this.server.middleware = [
      require("../middlewares/connect-logger")(),
      template && require(`../middlewares/connect-mock4${template}`)()
    ]
      .filter(Boolean)
      .concat(this.server.middleware);
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
