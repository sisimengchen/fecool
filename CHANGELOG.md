# fecool changelog

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