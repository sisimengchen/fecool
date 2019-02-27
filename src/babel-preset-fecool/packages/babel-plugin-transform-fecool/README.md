# babel-plugin-transform-fecool

fecool核心插件，要在@babel/preset-env在生成amd模块之后执行

## 主要功能

* 解析并收集amd模块的依赖
* 针对资源的类型，执行加载器，并插入加载器所构建的代码