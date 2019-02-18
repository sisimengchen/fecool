"use strict";

var _require = require("./constants"),
    MODULE = _require.MODULE,
    EXPORTS = _require.EXPORTS,
    REQUIRE = _require.REQUIRE; // A factory function is exported in order to inject the same babel-types object
// being used by the plugin itself


module.exports = function (t) {
  var decodeDefineArguments = function decodeDefineArguments(argNodes) {
    if (argNodes.length === 1) {
      return {
        factory: argNodes[0]
      };
    } else if (argNodes.length === 2) {
      var decodedArgs = {
        factory: argNodes[1]
      };

      if (t.isArrayExpression(argNodes[0])) {
        decodedArgs.dependencyList = argNodes[0];
      }

      return decodedArgs;
    } else {
      return {
        dependencyList: argNodes[1],
        factory: argNodes[2]
      };
    }
  };

  var decodeRequireArguments = function decodeRequireArguments(argNodes) {
    return {
      dependencyList: argNodes[0],
      factory: argNodes[1]
    };
  };

  var createModuleExportsAssignmentExpression = function createModuleExportsAssignmentExpression(value) {
    return t.returnStatement(value); // return t.expressionStatement(
    //   t.assignmentExpression(
    //     "=",
    //     t.memberExpression(t.identifier(MODULE), t.identifier(EXPORTS)),
    //     value
    //   )
    // );
  };

  var createModuleExportsResultCheck = function createModuleExportsResultCheck(value, identifier) {
    return [t.variableDeclaration("var", [t.variableDeclarator(identifier, value)]), t.expressionStatement(t.logicalExpression("&&", t.binaryExpression("!==", t.unaryExpression("typeof", identifier), t.stringLiteral("undefined")), createModuleExportsAssignmentExpression(identifier).expression))];
  };

  var createDependencyInjectionExpression = function createDependencyInjectionExpression(dependencyNode, variableName) {
    if (t.isStringLiteral(dependencyNode) && [MODULE, EXPORTS, REQUIRE].includes(dependencyNode.value)) {
      // In case of the AMD keywords, only create an expression if the variable name
      // does not match the keyword. This to prevent 'require = require' statements.
      if (variableName && variableName.name !== dependencyNode.value) {
        return t.variableDeclaration("var", [t.variableDeclarator(variableName, t.identifier(dependencyNode.value))]);
      }

      return undefined;
    }

    var requireCall = t.callExpression(t.identifier(REQUIRE), [dependencyNode]);

    if (variableName) {
      return t.variableDeclaration("var", [t.variableDeclarator(variableName, requireCall)]);
    } else {
      return t.expressionStatement(requireCall);
    }
  };

  var isModuleOrExportsInDependencyList = function isModuleOrExportsInDependencyList(dependencyList) {
    return dependencyList && dependencyList.elements.some(function (element) {
      return t.isStringLiteral(element) && (element.value === MODULE || element.value === EXPORTS);
    });
  }; // https://github.com/requirejs/requirejs/wiki/differences-between-the-simplified-commonjs-wrapper-and-standard-amd-define


  var isSimplifiedCommonJSWrapper = function isSimplifiedCommonJSWrapper(dependencyList, factoryArity) {
    return !dependencyList && factoryArity > 0;
  };

  var isSimplifiedCommonJSWrapperWithModuleOrExports = function isSimplifiedCommonJSWrapperWithModuleOrExports(dependencyList, factoryArity) {
    return isSimplifiedCommonJSWrapper(dependencyList, factoryArity) && factoryArity > 1;
  };

  var isModuleOrExportsInjected = function isModuleOrExportsInjected(dependencyList, factoryArity) {
    return isModuleOrExportsInDependencyList(dependencyList) || isSimplifiedCommonJSWrapperWithModuleOrExports(dependencyList, factoryArity);
  };

  var getUniqueIdentifier = function getUniqueIdentifier(scope, name) {
    return scope.hasOwnBinding(name) ? scope.generateUidIdentifier(name) : t.identifier(name);
  };

  var isFunctionExpression = function isFunctionExpression(factory) {
    return t.isFunctionExpression(factory) || t.isArrowFunctionExpression(factory);
  };

  var createFactoryReplacementExpression = function createFactoryReplacementExpression(factory, dependencyInjections) {
    if (t.isFunctionExpression(factory)) {
      return t.functionExpression(null, [], t.blockStatement(dependencyInjections.concat(factory.body.body)));
    }

    var bodyStatement;

    if (t.isBlockStatement(factory.body)) {
      bodyStatement = factory.body.body;
    } else {
      // implicit return arrow function
      bodyStatement = t.returnStatement(factory.body);
    }

    return t.arrowFunctionExpression([], t.blockStatement(dependencyInjections.concat(bodyStatement)));
  };

  return {
    decodeDefineArguments: decodeDefineArguments,
    decodeRequireArguments: decodeRequireArguments,
    createModuleExportsAssignmentExpression: createModuleExportsAssignmentExpression,
    createModuleExportsResultCheck: createModuleExportsResultCheck,
    createDependencyInjectionExpression: createDependencyInjectionExpression,
    isSimplifiedCommonJSWrapper: isSimplifiedCommonJSWrapper,
    isModuleOrExportsInjected: isModuleOrExportsInjected,
    getUniqueIdentifier: getUniqueIdentifier,
    isFunctionExpression: isFunctionExpression,
    createFactoryReplacementExpression: createFactoryReplacementExpression
  };
};