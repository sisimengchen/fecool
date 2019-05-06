# connect-mock4rentfeC

php 前后端分离中间件

## 主要功能

- 访问{name}.php 的文件，解析{name}.php 文件目录下的 {name}.mock.json 或者 mock.json 作为 mock 数据并与 php 模板渲染成页面返回
- 版本要求：php5.5+ 请确保 php -S 127.0.0.1:9527 可以在命令行执行

## 配置项

```javascript
const config = {
  phpServer: { // 本地php服务配置
    host: "fecool.com", // host可自己行分配（建议同开发服务器配置的一致）
    port: 9527 // php服务启动端口（这个端口要跟开发服务器配置的区别配置）
  },
  simulatorDirName: "./pc/views/.development", // php模拟目录
  mainlayoutFileName: "./pc/views/layouts/main.phtml" // layout文件
};
```
