# fecool changelog

## 0.0.19

### 增加php同步mock功能

## 0.0.18

### 优化timestamp配置

## 0.0.16 && 0.0.17

### 增加hasha配置

## 0.0.15

### 图片优化等级改为3

## 0.0.14

### 图片压缩统一由配置文件配置

## 0.0.13

### 修复require url的时候报错的问题

## 0.0.12

### 删除/* @thirdmodule */标记

  - 新建babel-preset-amd，替代@babel/preset-env内置的babel-plugin-transform-modules-amd功能（原有的不会判断是否已经是amd包，对于react这种已经打包成umd的会被二次包装）
  - 优化getBabelOptions配置
  - 优化js和jsx构建任务

## 0.0.11

### 配置文件解析增加错误提示

## 0.0.10

### tinytool代码转换优化

- 删除多余代码

## 0.0.9

### js语法支持

- 支持装饰器+class-properties
  - babel插件增加@babel/plugin-proposal-decorators
  - babel插件增加@babel/plugin-proposal-class-properties

## 0.0.8

### bug修复

- 修复process.env.IMAGE_MIN == "0"未执行打包程序的bug
  - imageCompress返回undefined未触发build的callback

## 0.0.7

### bug修复

- 修复部门项目http-proxy-middleware未找到报错的问题
  - 增加默认依赖http-proxy-middleware

## 0.0.6

### 依赖升级

- gulp3版本整体升级到gulp4
  - 修改task相关代码
  - 修改watch相关代码