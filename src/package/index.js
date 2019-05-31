/**
 * @file 依赖收集+打包工具
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const Concat = require("concat-with-sourcemaps");
const fs = require("fs");
const { getOptions } = require("../config");
const { printer } = require("../util");

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
      printer.debug("添加模块", name);
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
      printer.debug("添加依赖", name, dependencyName);
      this.addModule(dependencyName);
      module.dependencies.unshift(dependencyName);
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
    if (!module) return false; // 这里逻辑有点问题
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
    const envCode = getOptions().getEnvCode();
    const moduleNames = Object.keys(this.dependenciesMap); // 依赖map中所有的key 也就是所有待打包代码的路径列表
    const moduleCount = moduleNames.length;
    if (!moduleCount) return false;
    const commonModulesMap = {};
    for (let i = 0; i < moduleCount; i++) {
      const moduleName = moduleNames[i];
      const dependencies = this.dependenciesMap["" + moduleName]; // 获取待打包代码的依赖列表
      if (getOptions().isModuleDirectory(moduleName)) {
        commonModulesMap[moduleName + ""] = dependencies;
        continue;
      }
      const modulePath = getOptions().mapEntry2Output(moduleName); // 映射到目标目录的地址
      const concat = new Concat(false, "all.js", "\n");
      const packageall = Promise.all(
        dependencies.map((filePath, index) => {
          // 优化方案common_modules中的单独打包
          if (getOptions().isModuleDirectory(filePath)) {
            return Promise.resolve({
              filePath,
              code: ""
            });
          }
          return new Promise((resolve, reject) => {
            const outPutPath = getOptions().mapEntry2Output(filePath);
            fs.readFile(outPutPath, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  outPutPath,
                  code: data.toString()
                });
              }
            });
          });
        })
      );
      packageall
        .then(datas => {
          concat.add("env.js", envCode);
          datas.forEach((data, index) => {
            const { outPutPath, code } = data;
            if (!code) return;
            try {
              concat.add(outPutPath, code);
            } catch (error) {
              console.log(outPutPath);
              console.log(error);
            }
          });
          const out = fs.createWriteStream(modulePath, {
            encoding: "utf8"
          });
          out.write(concat.content);
          out.end();
        })
        .catch(error => {});
    }
    const completedCommonModules = [];
    const completedCommonCache = {};
    let commonModuleNames = Object.keys(commonModulesMap);
    const commonModuleCount = commonModuleNames.length;
    if (!commonModuleCount) return false;
    let index = 0;
    while (commonModuleNames.length) {
      const moduleName = commonModuleNames[index];
      const dependencies = commonModulesMap["" + moduleName];
      const filters = dependencies.filter(item => {
        if (completedCommonCache["" + item]) {
          return false;
        } else {
          return true;
        }
      });
      if (filters.length == 1) {
        completedCommonModules.push(moduleName);
        completedCommonCache["" + moduleName] = true;
        commonModuleNames = commonModuleNames.filter(
          item => item != moduleName
        );
        index = 0;
      } else {
        index++;
      }
    }
    const commonModuleConcat = new Concat(false, "commonModule.js", "\n");
    const packageallCommonModule = Promise.all(
      completedCommonModules.map((filePath, index) => {
        return new Promise((resolve, reject) => {
          const outPutPath = getOptions().mapEntry2Output(filePath);
          fs.readFile(outPutPath, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                outPutPath,
                code: data.toString()
              });
            }
          });
        });
      })
    );
    packageallCommonModule
      .then(datas => {
        datas.forEach((data, index) => {
          const { outPutPath, code } = data;
          try {
            commonModuleConcat.add(outPutPath, code);
          } catch (error) {
            console.log(outPutPath);
            console.log(error);
          }
        });
        const out = fs.createWriteStream(getOptions().getCommonModuleOutput(), {
          encoding: "utf8"
        });
        out.write(commonModuleConcat.content);
        out.end();
      })
      .catch(error => {});
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
