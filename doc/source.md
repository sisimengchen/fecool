# 源码说明

## bin目录
+ build：生成配置执行构建命令
+ cli：基于commander实现的命令行处理器
+ server：获取配置启动开发服务

## src目录
+ babel-plugin-fecool-helper：通过分析代码类型设置sourceType的babel插件
+ babel-plugin-transform-tinytool：针对sourceTyp == 'tinytooljs'的代码做转换
+ babel-preset-fecool：为fecool而开发的preset
  + babel-plugin-transform-fecool：fecool核心插件，依赖收集，loader执行，路径解析
  + babel-plugin-transform-remove-strict：针对tinytooljs的代码删除use strict（tinytool类型的代码编译之后加上use strict会报错）
+ config：fecool配置生成器
  + defaultOptions：fecool默认配置
  + getBabelOptions：fecool编译的babel配置生成器
  + getOptions：fecool配置解析类，单例
+ gulp-plugin：fecool的gulp插件
  + gulp-printer：gulp日志输出plugin
+ less-plugin：fecool的less插件
  + less-plugin-resolve-urls：解析less中url代码，并编译成绝对路径
+ loader：fecool的javascript资源加载器，供babel-plugin-transform-fecool处理资源使用
  + default-loader：默认loader，补全路径
  + image-loader：图片的loader，小于10000m，插入base64，大于10000m插入图片绝对路径
  + json-loader：json的loader，插入json字符串对应的js对象
  + style-loader：style的loader，插入一个可以插入删除样式表的对象
  + template-loader：template的loader，插入一段字符串
+ middlewares：fecool的browsersync中间件，用来实现开发服务器
  + connect-logger：日志中间件
  + connect-mock4ejs：ejs mock中间件
  + connect-mock4php：php mock中间件
  + connect-mock4rentfeC：租赁c端php mock中间件
+ package：fecool的打包器，通过从babel-plugin-transform-fecool收集的依赖来打包
+ tasks：fecool的gulp任务
  + clean：清理任务
  + css：css、less、stylus处理任务
  + image：图片压缩（主流程中未开启）
  + js：js、jsx编译
  + main：监听任务，开发环境下构建任务，生产环境构建任务（通过main启动构建工作流）
  + other：其他任务
  + templates：模板处理任务
+ tools：小工具（fecool构建流程中未用到，里面放了一个可以把目录下所有js加上/* @tinytooljs */\n的工具）
+ util：fecool的util包
  + asciiArt：输出asciiArt
  + extname：修改扩展名
  + getDataURI：生成dataRUI字符串
  + isDataURI：判断一个字符串是否是dataRUI
  + isDirectory：判断一个字符串是否是一个本地路径
  + isFile：判断一个字符串是否是一个本地文件
  + isPath：判断一个字符串是否是一个路径
  + isRelativePath：判断一个字符串是否是一个相对路径
  + isURL：判断一个字符串是否是一个URL
  + md5：文件md5
  + printer：日志打印工具
  + swallowError：针对gulp报错增加的吞异常的函