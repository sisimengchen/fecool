const path = require("path");
const resolve = require("resolve");
const { URL } = require("url");
const { isURL, isPath, isRelativePath, printer } = require("../util");

class Options {
  constructor(options) {
    this.__options = options;
    // console.log(options);
    this.process(options);
  }

  process(options) {
    const { entry, output, resolve } = options;
    this.mode = options.mode ? options.mode : "development";
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
    this.alias = {};
    Object.keys(resolve.alias).forEach((item, index) => {
      this.isAliasOn = true;
      const alia = resolve.alias[item];
      this.alias[item] = path.isAbsolute(alia)
        ? alia
        : path.join(this.context, alia);
    });
    this.js = this.__options.js;
    this.css = this.__options.css;
    this.moduleDirectory = this.__options.moduleDirectory || [];
  }

  isDevelopENV() {
    return this.mode === "development";
  }

  mapEntry2Output(src) {
    return src.replace(this.sourceDir, this.distDir);
  }
  /**
   *
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

  getResourcePath(source, basedir) {
    // 根据依赖资源描述的路径找到资源具体所在的文件路径
    let resourcePath = source;
    try {
      resourcePath = resolve.sync(source, {
        moduleDirectory: this.moduleDirectory,
        basedir: basedir
      }); // 通过npm寻路方式解析依赖资源路径
    } catch (error) {
      resourcePath = this.resolveAlias(source); // 如果解析不到，则查到alias中的映射
    } finally {
    }
    return resourcePath;
  }

  // getSourceURL(source, basedir, suffix = '') {
  //   basedir = basedir || this.sourceDir
  //   if (source && isURL(source)) { // 如果source是一个url则直接返回
  //     return source;
  //   }
  //   if (source && path.isAbsolute(source)) { // 如果source是一个绝对的路径，source解析为相对于入口(网站根路径)的绝对路径
  //     return this.getURL(source);
  //   }
  //   if (source && isPath(source)) {
  //     // 如果source是一个路径，解析alias
  //     source = this.resolveAlias(source);
  //     return this.getURL(source);
  //   }
  //   return source
  // }

  /**
   * [根据资源绝对路径获取编译后的url]
   * @param  {[String]} source    [资源绝对路径]
   * @return {[String]}           [资源编译后的url]
   */
  getURL(source = "nosource") {
    if (isURL(source)) {
      console.log(1);
      return source;
    } else if (isPath(source)) {
      console.log(2);
      return `${this.publicPath}/${path.relative(this.sourceDir, source)}`;
    } else {
      console.log(3);
      return source;
    }
  }

  /**
   * [根据依赖资源描述的路径找到资源具体所在的文件路径]
   * @param  {[String]} source    [依赖值]
   * @param  {[String]} basedir   [源文件所在的当前目录]
   * @return {[String]}           [依赖资源具体所在的文件路径]
   */
  resolve(source, filename) {
    if (isURL(source)) {
      return source;
    }
    // if (source && !isPath(source)) {
    //   return source;
    // }
    source = this.normalize(source, filename); // normalize化
    // 利用 browserify/resolve（ https://github.com/browserify/resolve ) 进行寻路
    const resourcePath = resolve.sync(source, {
      moduleDirectory: this.moduleDirectory,
      basedir: path.dirname(filename),
      extensions: [".js", ".es6", ".jsx"]
    });
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
}

let userOptions = {};
try {
  userOptions = require(path.resolve(process.cwd(), "fetool.config.js"));
} catch (error) {
  printer.warn(
    `用户配置文件${path.resolve(
      process.cwd(),
      "fetool.config.js"
    )}不存在，启用默认配置`
  );
}

let instance;

const getOptions = function() {
  if (instance) {
    return instance;
  } else {
    options = Object.assign({}, require("./defaultOptions.js"), userOptions);
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
