# babel-plugin-tinytool

针对旧版本的tinytool代码做兼容而开发的插件，通过解析代码顶部的注释生效

## 主要功能

* 判断代码顶部是否有注释标记
* 解出被顶层define所包裹的代码，并使用一个IIFE包裹起来，最后创建一个return把IIFE返回出来，这个转换代码部分参考自[babel-plugin-transform-amd-to-commonjs](https://github.com/msrose/babel-plugin-transform-amd-to-commonjs)
* 收集require, __include, __includejson的函数调用，并转化成import from 语法

## 针对广厦m站代码特殊开发记录

```js
var routerMap = __includejson("channel_page/router");
var pageTpl = __include('channel_page/house_info/index')
var showMsg = require('ui/toast/index').showMsg
var parseQueryString = require('util/parseQueryString')()
```

## 针对广厦m站无法转换的记录（需要手改）

```js
var config = {
  apartment: require('channel_page/house_info/central'),
  scattered: require('channel_page/house_info/scattered')
} [type]
```