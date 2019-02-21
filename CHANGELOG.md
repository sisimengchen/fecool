# fecool changelog

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