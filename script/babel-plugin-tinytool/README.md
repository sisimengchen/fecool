# babel-plugin-tinytool

针对旧版本的tinytool代码做兼容而开发的插件，正常不需要引入

主要功能：

1.解出被顶层define所包裹的代码，导出成类似于cmd的方式
2.收集 require  __include  __includejson 依赖