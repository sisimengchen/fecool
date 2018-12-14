/**
 * @file 依赖打包工具
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
const Concat = require("concat-with-sourcemaps");
const UglifyJS = require("uglify-js");
const { getOptions } = require("../config");
const fs = require("fs");
class Package {
  constructor(options) {
    this.module = {};
    this.package = {};
    this.increment = 0;
    this.dependenciesMap = {};
    this.dependenciesCache = {};
    this.isResovled = false;
  }

  /**
   * 添加模块
   * @param {*} name 模块名
   */
  addModule(name) {
    // 添加模块id
    let module = this.module["" + name];
    if (!module) {
      // 未缓存 => 新增
      this.module["" + name] = {
        id: this.increment,
        count: 0,
        name: name,
        dependencies: []
      };
      module = this.module["" + name];
      this.increment++;
    }
    module.count = module.count + 1;
    return module;
  }

  /**
   * 添加依赖
   * @param {*} name 模块名
   * @param {*} dependencyName 依赖模块名
   */
  addDependency(name, dependencyName) {
    let module = this.module["" + name];
    if (!module) {
      return;
    }
    let pkg = this.package["" + name];
    if (!pkg) {
      this.package["" + name] = module;
      pkg = this.package["" + name];
    }
    if (module && pkg) {
      module.dependencies.push(dependencyName);
    }
  }

  /**
   * 模块名获取所有的依赖数组
   * @param {*} name
   * @param {*} allDependencies 依赖容器数组
   * @param {*} cache 去重对象
   */
  getDependenciesByName(name, allDependencies = [], cache = {}) {
    let module = this.module["" + name];
    if (!module) return false;
    if (!cache[name]) {
      cache["" + name] = true;
      allDependencies.unshift(name);
    }
    if (!module.dependencies) return false;
    if (!module.dependencies.length) return false;
    const count = module.dependencies.length;
    for (let i = 0; i < count; i++) {
      const dependency = module.dependencies[i];
      this.getDependenciesByName(dependency, allDependencies, cache);
    }
  }

  /**
   * 解析所有模块的依赖 最终结果会放到this.dependenciesMap 中
   * 存在问题：互相依赖的包的处理，后续再说
   */
  resovleDependencies() {
    const moduleNames = Object.keys(this.module);
    const moduleCount = moduleNames.length;
    if (!moduleNames.length) return false;
    this.dependenciesMap = {};
    this.dependenciesCache = {};
    this.isResovled = false;
    let i = 0;
    for (; i < moduleCount; i++) {
      const moduleName = moduleNames[i];
      const allDependencies = [];
      const cache = {};
      this.getDependenciesByName(moduleName, allDependencies, cache);
      this.dependenciesMap["" + moduleName] = allDependencies;
      this.dependenciesCache["" + moduleName] = cache;
    }
    if (i === moduleCount) {
      this.isResovled = true;
    }
  }

  /**
   * 合并并生成依赖的代码
   */
  concatDependencies() {
    if (!this.isResovled) return;
    const moduleNames = Object.keys(this.dependenciesMap);
    const moduleCount = moduleNames.length;
    if (!moduleNames.length) return false;
    for (let i = 0; i < moduleCount; i++) {
      const moduleName = moduleNames[i];
      const dependencies = this.dependenciesMap["" + moduleName];
      const concat = new Concat(false, "all.js", "\n");
      const modulePath = getOptions().mapEntry2Output(moduleName);
      dependencies.forEach((item, index) => {
        let code = fs.readFileSync(getOptions().mapEntry2Output(item), "utf8");
        if (!getOptions().isDevelopENV()) {
          // 如果是开发环境，则不执行js的编译
          const result = UglifyJS.minify(code);
          code = result.code;
        }
        concat.add(item, code);
      });
      const out = fs.createWriteStream(modulePath, {
        encoding: "utf8"
      });
      out.write(concat.content);
      out.end();
    }
  }
}

let instance;

const getPackage = function() {
  if (instance) {
    return instance;
  } else {
    instance = new Package();
    return instance;
  }
};

module.exports = getPackage;
