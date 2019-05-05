"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @file 依赖收集+打包工具
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var Concat = require("concat-with-sourcemaps");

var fs = require("fs");

var _require = require("../config"),
    getOptions = _require.getOptions;

var _require2 = require("../util"),
    printer = _require2.printer;

var Package =
/*#__PURE__*/
function () {
  function Package(options) {
    _classCallCheck(this, Package);

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


  _createClass(Package, [{
    key: "addModule",
    value: function addModule(name) {
      // 添加模块id
      var module = this.module["" + name];

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

  }, {
    key: "addDependency",
    value: function addDependency(name, dependencyName) {
      var module = this.module["" + name];

      if (!module) {
        return;
      }

      var pkg = this.package["" + name];

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

  }, {
    key: "getDependenciesByName",
    value: function getDependenciesByName(name) {
      var allDependencies = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var module = this.module["" + name];
      if (!module) return false; // 这里逻辑有点问题

      if (!cache[name]) {
        cache["" + name] = true;
        allDependencies.unshift(name);
      }

      if (!module.dependencies) return false;
      if (!module.dependencies.length) return false;
      var count = module.dependencies.length;

      for (var i = 0; i < count; i++) {
        var dependency = module.dependencies[i];
        this.getDependenciesByName(dependency, allDependencies, cache);
      }
    }
    /**
     * 解析所有模块的依赖 最终结果会放到this.dependenciesMap 中
     * 存在问题：互相依赖的包的处理，后续再说
     */

  }, {
    key: "resovleDependencies",
    value: function resovleDependencies() {
      var moduleNames = Object.keys(this.module);
      var moduleCount = moduleNames.length;
      if (!moduleNames.length) return false;
      this.dependenciesMap = {};
      this.dependenciesCache = {};
      this.isResovled = false;
      var i = 0;

      for (; i < moduleCount; i++) {
        var moduleName = moduleNames[i];
        var allDependencies = [];
        var cache = {};
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

  }, {
    key: "concatDependencies",
    value: function concatDependencies() {
      var _this = this;

      if (!this.isResovled) return;
      var envCode = getOptions().getEnvCode();
      var moduleNames = Object.keys(this.dependenciesMap);
      var moduleCount = moduleNames.length;
      if (!moduleNames.length) return false;

      var _loop = function _loop(i) {
        var moduleName = moduleNames[i];
        var dependencies = _this.dependenciesMap["" + moduleName];
        var modulePath = getOptions().mapEntry2Output(moduleName);
        var concat = new Concat(false, "all.js", "\n");
        var packageall = Promise.all(dependencies.map(function (filePath, index) {
          return new Promise(function (resolve, reject) {
            var outPutPath = getOptions().mapEntry2Output(filePath);
            fs.readFile(outPutPath, function (err, data) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  outPutPath: outPutPath,
                  code: data.toString()
                });
              }
            });
          });
        }));
        packageall.then(function (datas) {
          concat.add("env.js", envCode);
          datas.forEach(function (data, index) {
            var outPutPath = data.outPutPath,
                code = data.code;

            try {
              concat.add(outPutPath, code);
            } catch (error) {
              console.log(outPutPath);
              console.log(error);
            }
          });
          var out = fs.createWriteStream(modulePath, {
            encoding: "utf8"
          });
          out.write(concat.content);
          out.end();
        }).catch(function (error) {});
      };

      for (var i = 0; i < moduleCount; i++) {
        _loop(i);
      }
    }
  }]);

  return Package;
}();

var instance;

var getPackage = function getPackage() {
  if (instance) {
    return instance;
  } else {
    instance = new Package();
    return instance;
  }
};

module.exports = getPackage;