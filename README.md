# fecool

fecool 前端工程构建工具。解决前端工程中，资源加载、依赖管理，代码合并，资源压缩、模块化开发、代码部署、访问代理、mock 生成等问题。

![fecool](doc/flow.png "fecool")

### 功能列表

- javascript 代码支持 - 内置@babel/preset-env 支持编 es6 代码，支持资源内嵌，并生成 amd 包
- jsx 代码支持 - 内置@babel/preset-react 支持编译.jsx 后缀的代码文件，支持资源内嵌，并生成为 amd 包
- less 代码支持（推荐） - 支持资源寻路，内置 postcss 支持前缀补全等功能
- css 代码支持 - 支持资源寻路，内置 postcss 支持前缀补全等功能
- stylus 代码支持 - 支持资源寻路，内置 postcss 支持前缀补全等功能
- html 代码支持 - 支持资源寻路，资源内嵌，压缩
- 图片压缩 - 支持图片压缩，hash 值生成功能
- 其他资源 - 支持 hash 值生成功能
- 开发服务器 - 内置 browser-sync + http-proxy-middleware，支持访问代理配置，ejs 模板 mock 生成功能

### 示例

[示例项目源码访问](https://github.com/sisimengchen/fecool_demos)
[示例项目构建访问](https://sisimengchen.github.io/fecool_demos)

### 安装

```shell
npm install --save fecool
```

### 构建

生产环境构建

```shell
fecool
```

开发环境构建

```shell
fecool -d -e development
```

监听文件变化

```shell
fecool -d -e development -w
```

启动开发服务

```shell
fecool -s
```

### 配置项

项目配置文件：工具启动默认会导入当前项目根目录下的 fecool.config.js
自定义项目配置文件：通过 fecool 的命令行工具增加-c 参数，支持其他配置文件，例如：fecool -d -e development -w -c fecool.config.juejin.js
建议：项目中开发环境和编译环境采用两套配置文件

```javascript
const config = {
  context: process.cwd(), // 当前编译上下文，建议直接采用这个
  entry: {
    path: "./src", // 源码根目录
    common: "./src/common", // 公共源码目录
    exclude: ["./src/third"] // 不被编译的资源，可以为目录，也可以为文件
  },
  output: {
    path: "./dist", // 导出代码根目录
    common: "./dist/common", // 导出公共代码根目录
    publicPath: "//fecool.com:8080", // 静态资源路径前缀
    hasha: false, // 是否开启文件hasha
    timestamp: +new Date(), // 指定资源构建的时间戳，为空则无
    args: {
      // 构建注入参数 可通过window.__args访问这个对象，系统会额外增加上两个属性buildTimestamp（构建时间戳），env（构建环境）
      x: 1
    },
    ignoreExt: ['.md'] // 忽略输出的资源扩展名，一些非代码资源是否需要被移动到编译目录，可以通过这个增加扩展名控制
  },
  resolve: {
    alias: {
      // 资源寻路别名
      components: "./src/components",
      page: "./src/page",
      utils: "./src/utils"
    }
  },
  server: {
    // browser-sync 配置 具体请参考 https://www.browsersync.io/docs/options
    port: 8080,
    single: true, // 启用单页面模式
    open: "external", // 启动浏览器 "external"
    host: "fecool.com",
    watch: false,
    middleware: [
      [
        "connect-mock4rentfeC", // 4个内置中间件之一具体功能请见 src/middlewares目录
        {
          phpServer: {
            host: "fecool.com",
            port: 9527
          },
          simulatorDirName: "./pc/views/.development",
          mainlayoutFileName: "./pc/views/layouts/main.phtml"
        }
      ]
    ] // 中间件
  },
  optimization: {
    imagemin: false, // 启用图片压缩
    retainExtname: true // 保留扩展名
  }
};

module.exports = config;
```

### 解惑

##### 什么是资源寻路？都哪些资源支持寻路？如何触发资源的寻路

资源寻路就是，fecool 会根据当前代码里对其他资源的引用代码，解析资源，并根据用户设定的 output.publicPath 去生成资源最终在 web 服务器中的绝对路径。解析资源主要采用了类似于 nodejs 的寻路方式，只不过 fecool 为了避免解析到 node_moudules 中的资源，把 node_moudules 目录改成了 common_modules 目录。

\*注意 node_moudules 这种寻路方式只适用于 javascript 代码，针对模板以及样式表的寻路，请正常按照文件的相对路径引用方式。

目前支持资源寻路的资源包括：js,css,less,stylus,html,以及作为 js 代码导入的 tmpl

针对 js 文件，触发寻路的方式有:es6 的 import，amd 的 require。比如 import React from "react"这段代码，会直接寻找当前代码文件外层最近的 common_modules 目录下的 react.js 或 react/index.js（如果不存在则继续寻找第二近的，以此类推），并在编译后会根据 output.publicPath 补全成一个绝对路径的 url。

针对 css,less,stylus,html,phtml 以及作为 js 代码导入的 tmpl,json，需要对在路径后添加一个#url 符号来触发编译寻路功能，比如 background-image: url("./img/nodata.png#url")这段代码，会把./img/nodata.png 在编译后会根据 output.publicPath 补全成一个绝对路径的 url。

编译完成后，所有支持寻路的资源都会生成一个绝对的 url，这个 url 大体就是部署在 web 容器上该资源的访问 url。

##### 配置项里的 entry.common 和 output.common，这个 common 是什么？为什么要指定 common

entry.common 目录是一个很特殊的目录，这个目录下的.js 代码不参与任何编译和寻路过程，并最后会被合并成一个文件 common.js，如果你想使用成熟的编译后的，并且不会其他代码寻找到的 js 库，比如 jquery，requirejs（目前不用这玩意 fecool 就跑不转），polyfill.js 等等，建议都放到这里。output.common 就是 common.js 的输出目录，没什么好说的，相对一致就好。

##### 配置项里的 resolve.alias 是什么？resolve.alias 怎么用？

resolve.alias 是用来为资源寻路增加一个目录的别名，key 代表了目录别名，value 代表了对应的目录。比如当你定义了 components: "./src/components", import 'components/xxx' 在路径解析的时候会去解析./src/components/xxx，会帮你省去一些多余的...

##### 配置项里有 output.args，这个 output.args 是什么？

args 这个对象会注入到到每一个构建输出 js 代码包里，当加载了代码包后，可以通过 window.\_\_args 访问 args 这个对象的值。
在 fecool 构建过程中，会给 args 自动插入两个属性：buildTimestamp（构建时间戳），env（构建环境）用来帮助开发者获取一些构建的必要基本信息

##### 关于 /\* \@tinytooljs \*\/ 的使用

这两个注释是针对 js 代码做的特殊标记。fecool 解析到代码文件头几个字符是这俩个注释中的一个，都会触发特殊的构建条件。
/_ @tinytooljs _/ 表示的是旧版 tinytooljs 工具的 js 代码，当检测到有这个注释的时候，系统会触发额外的构建流程，兼容 tinytooljs 所构建出的代码。

##### 关于开发服务器的使用

fecool 内置 browser-sync + http-proxy-middleware，支持访问代理配置。各个项目代理配置情况需要自定义，需要用 http-proxy-middleware 生成一个中间件，放到 server.middleware 中即可,具体配置请参考[browser-sync 配置](https://www.browsersync.io/docs/options)，[http-proxy-middleware 配置](https://github.com/chimurai/http-proxy-middleware)。

当前版本的 fecool 同时支持 ejs 同步 mock 功能，当用开发服务器访问.ejs 资源的时候，把通目录下的 mock.ejsjson 文件作为 js 对象注入到 ejs 模板中。
v0.0.19 版本的 fecool 支持 php 同步 mock 功能，当用开发服务器访问.php 资源的时候，把通目录下的 mock.phpjson 文件作为 php 对象注入到 php 模板中。

### [注意事项](doc/attention.md)

### [源码说明](doc/source.md)
