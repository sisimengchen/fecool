# fecool changelog

## 0.1.9

### 构建优化

- 给babel-plugin-fecool-helper增加js代码类型判断功能
- 优化babel-plugin-transform-tinytool代码转化过程
- 优化getBabelOptions配置不受外部配置文件干扰
- 优化json-loader，style-loader，template-loader使得在生产环境支持代码压缩
- 控制台增加版本展示

## 0.1.6

### 迭代升级

- 通过/* @umdjs */注释跳过babel-plugin-transform-modules-amd的多余包装

## 0.1.5

### 配置优化

- 增加entry.tinytooljs配置true则默认引入tinytooljs编译逻辑

## 0.1.4

### 构建优化

- 单独打包common_modules目录下的js成common/commonmodules.js

## 0.1.3

### 迭代升级

- 取消使用@babel/plugin-transform-runtime，如果必要先自行在common目录引入polyfill.js，后续会考虑默认植入

## 0.1.1

### 修复bug

- 修复common_modules下文件编译多包装一层require问题

## 0.1.0-alpha.7

### 迭代升级

- 增加 entry.exclude 配置
- 增加 output.ignoreExt 配置

## 0.1.0-alpha.3

### 迭代升级

- 增加 connect-mock4rentfeC 中间件
- 增加 phtml 编译任务
- 优化 js 代码构建流程
- 优化配置
- 新增 output.hasha 配置
- 新增 output.timestamp 配置
- 新增 output.imagemin 配置
- 新增 optimization.args 配置
- 新增 optimization.retainExtname 配置
- 优化 styl,less 构建错误异常处理

## 0.0.19

### 增加 php 同步 mock 功能

## 0.0.18

### 优化 timestamp 配置

## 0.0.16 && 0.0.17

### 增加 hasha 配置

## 0.0.15

### 图片优化等级改为 3

## 0.0.14

### 图片压缩统一由配置文件配置

## 0.0.13

### 修复 require url 的时候报错的问题

## 0.0.12

### 删除/_ @thirdmodule _/标记

- 新建 babel-preset-amd，替代@babel/preset-env 内置的 babel-plugin-transform-modules-amd 功能（原有的不会判断是否已经是 amd 包，对于 react 这种已经打包成 umd 的会被二次包装）
- 优化 getBabelOptions 配置
- 优化 js 和 jsx 构建任务

## 0.0.11

### 配置文件解析增加错误提示

## 0.0.10

### tinytool 代码转换优化

- 删除多余代码

## 0.0.9

### js 语法支持

- 支持装饰器+class-properties
  - babel 插件增加@babel/plugin-proposal-decorators
  - babel 插件增加@babel/plugin-proposal-class-properties

## 0.0.8

### bug 修复

- 修复 process.env.IMAGE_MIN == "0"未执行打包程序的 bug
  - imageCompress 返回 undefined 未触发 build 的 callback

## 0.0.7

### bug 修复

- 修复部门项目 http-proxy-middleware 未找到报错的问题
  - 增加默认依赖 http-proxy-middleware

## 0.0.6

### 依赖升级

- gulp3 版本整体升级到 gulp4
  - 修改 task 相关代码
  - 修改 watch 相关代码
