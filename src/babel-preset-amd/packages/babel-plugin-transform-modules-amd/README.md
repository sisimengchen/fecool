# babel-plugin-transform-modules-amd

改造现有 babel-plugin-transform-modules-amd 的，要在@babel/preset-env 之前执行

原地址[https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-modules-amd]

## 主要功能

- 把非 amd 的模块转换成 amd
- 判断当前模块是否包含 define，如果包含则不做包装
