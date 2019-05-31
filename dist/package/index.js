"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Concat = require("concat-with-sourcemaps");

var fs = require("fs");

var _require = require("../config"),
    getOptions = _require.getOptions;

var _require2 = require("../util"),
    printer = _require2.printer;

var Package = function () {
  function Package(options) {
    _classCallCheck(this, Package);

    this.module = {};
    this["package"] = {};
    this.increment = 0;
    this.dependenciesMap = {};
    this.dependenciesCache = {};
    this.isResovled = false;
  }

  _createClass(Package, [{
    key: "addModule",
    value: function addModule(name) {
      var module = this.module["" + name];

      if (!module) {
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
  }, {
    key: "addDependency",
    value: function addDependency(name, dependencyName) {
      var module = this.module["" + name];

      if (!module) {
        return;
      }

      var pkg = this["package"]["" + name];

      if (!pkg) {
        this["package"]["" + name] = module;
        pkg = this["package"]["" + name];
      }

      if (module && pkg) {
        printer.debug("添加依赖", name, dependencyName);
        this.addModule(dependencyName);
        module.dependencies.unshift(dependencyName);
      }
    }
  }, {
    key: "getDependenciesByName",
    value: function getDependenciesByName(name) {
      var allDependencies = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var module = this.module["" + name];
      if (!module) return false;

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
  }, {
    key: "concatDependencies",
    value: function concatDependencies() {
      if (!this.isResovled) return;
      var moduleNames = Object.keys(this.dependenciesMap);
      var moduleCount = moduleNames.length;
      if (!moduleCount) return false;
      var commonModulesMap = {};

      for (var i = 0; i < moduleCount; i++) {
        var moduleName = moduleNames[i];
        var dependencies = this.dependenciesMap["" + moduleName];

        if (getOptions().isModuleDirectory(moduleName)) {
          commonModulesMap[moduleName + ""] = dependencies;
          continue;
        }

        var modulePath = getOptions().mapEntry2Output(moduleName);
        this.executePackage(modulePath, dependencies, false);
      }

      var completedCommonModules = [];
      var completedCommonCache = {};
      var commonModuleNames = Object.keys(commonModulesMap);
      var commonModuleCount = commonModuleNames.length;
      if (!commonModuleCount) return false;
      var index = 0;

      var _loop = function _loop() {
        var moduleName = commonModuleNames[index];
        var dependencies = commonModulesMap["" + moduleName];
        var filters = dependencies.filter(function (item) {
          if (completedCommonCache["" + item]) {
            return false;
          } else {
            return true;
          }
        });

        if (filters.length == 1) {
          completedCommonModules.push(moduleName);
          completedCommonCache["" + moduleName] = true;
          commonModuleNames = commonModuleNames.filter(function (item) {
            return item != moduleName;
          });
          index = 0;
        } else {
          index++;
        }
      };

      while (commonModuleNames.length) {
        _loop();
      }

      this.executePackage(getOptions().getCommonModuleOutput(), completedCommonModules, true);
    }
  }, {
    key: "executePackage",
    value: function executePackage(packagePath) {
      var dependencies = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var isModulePackage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (!packagePath) return false;
      if (!dependencies.length) return false;
      var concat = new Concat(false, "all.js", "\n");
      var packageall = Promise.all(dependencies.map(function (filePath, index) {
        if (isModulePackage == false && getOptions().isModuleDirectory(filePath)) {
          return Promise.resolve({
            filePath: filePath,
            code: ""
          });
        }

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
        isModulePackage == false && concat.add("env.js", getOptions().getEnvCode());
        datas.forEach(function (data, index) {
          var outPutPath = data.outPutPath,
              code = data.code;
          if (!code) return;

          try {
            concat.add(outPutPath, code);
          } catch (error) {
            console.log(outPutPath);
            console.log(error);
          }
        });
        var out = fs.createWriteStream(packagePath, {
          encoding: "utf8"
        });
        out.write(concat.content);
        out.end();
      })["catch"](function (error) {});
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