# babel-plugin-transform-modules-remove-strict

针对旧版本的tinytool代码做兼容而开发的插件，由于@babel/preset-env在生成amd模块的时候，会默认给define内增加"use strict"，会导致旧版本中的部分代码引起报错

## 主要功能

* 去掉严格模式标记