const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const ejs = require("ejs");
const HttpProxy = require("http-proxy");
const { getOptions } = require("../../config");
const { printer } = require("../../util");

const globalOptions = getOptions();

const defaultOptions = {
  phpServer: {
    host: "127.0.0.1",
    port: 9527
  },
  simulatorDirName: "",
  mainlayoutFileName: ""
};

module.exports = function(options = {}) {
  options = {
    defaultOptions,
    ...options
  };
  options.phpServerUrl = `http://${options.phpServer.host}:${
    options.phpServer.port
  }`;
  options.simulatorDirName = path.isAbsolute(options.simulatorDirName)
    ? options.simulatorDirName
    : path.join(globalOptions.context, options.simulatorDirName);
  options.mainlayoutFileName = path.isAbsolute(options.mainlayoutFileName)
    ? options.mainlayoutFileName
    : path.join(globalOptions.context, options.mainlayoutFileName);
  options.mainlayoutFileName = globalOptions.mapEntry2Output(
    options.mainlayoutFileName
  );
  const viewRendererSimulatorFileName = path.resolve(
    options.simulatorDirName,
    "./ViewRendererSimulator.php"
  ); // ViewRenderer 模拟类php路径
  const commonMockFileName = path.resolve(
    options.simulatorDirName,
    "./mock_base.json"
  ); // 公共的mock文件
  const defaultMockFileName = path.resolve(
    options.simulatorDirName,
    "./mock_default.json"
  ); // 默认的私有mock文件
  const templateFileName = path.resolve(
    options.simulatorDirName,
    "./template.php"
  ); // 代码模板文件
  const phpServer = spawn("php", [
    "-S",
    `${options.phpServer.host}:${options.phpServer.port}`,
    "-t",
    globalOptions.distDir
  ]);
  phpServer.stdout.on("data", data => {
    printer.log(data.toString());
  });
  phpServer.stderr.on("data", error => {
    printer.error(error.toString());
  });
  phpServer.on("close", code => {
    printer.log("close");
  });
  return function(req, res, next) {
    const pathname = req._parsedUrl.pathname; // 获取访问的路径
    const search = req._parsedUrl.search;
    const { ext, base, name } = path.parse(pathname); // ext => '.phtml'  base => 'xxx.phtml'
    if (ext && ext.toLocaleLowerCase() === ".phtml") {
      // 如果路径的扩展名是phtml则执行中间件
      const fileName = path.join(globalOptions.distDir, pathname); // 通过url获取要访问的文件
      if (!fs.existsSync(fileName)) {
        // 如果文件不存在则执行next()
        next();
        return;
      }
      let mockFileName = path.join(fileName, `../${name}.mock.json`); // 默认的mock文件路径
      const mockFileNameAlternate = path.join(fileName, "../mock.json"); // 替代的mock文件路径
      if (!fs.existsSync(mockFileName)) {
        if (!fs.existsSync(mockFileNameAlternate)) {
          // 如果两层mock都不存在则使用默认mock
          mockFileName = defaultMockFileName;
        } else {
          mockFileName = mockFileNameAlternate;
        }
      }
      // 最终生成的php路径
      ejs.renderFile(
        templateFileName,
        {
          commonMockFileName, // 公共的mock
          mockFileName, // 私有的的mock
          viewRendererSimulatorFileName,
          mainlayoutFileName: options.mainlayoutFileName, // php layout 模板
          fileName // php模板
        },
        options,
        function(error, codes) {
          if (error) {
            printer.error(error);
            res.end(error.toString());
            return;
          }
          const outPath = path.join(fileName, `../${name}${+new Date()}.php`); // 最终生成的php路径
          // 生成代码
          fs.writeFile(outPath, codes, "utf8", error => {
            if (error) {
              printer.error(error);
              res.end(error.toString());
              return;
            }
            const target = `${options.phpServerUrl}/${path.relative(
              globalOptions.distDir,
              outPath
            )}${search ? search : ""}`; // php服务的
            const proxy = new HttpProxy(); // 创建代理
            proxy.on("proxyRes", function(proxyRes, req, res) {
              proxyRes.on("end", function() {
                fs.unlinkSync(outPath);
                proxy.close();
              });
            });
            proxy.web(
              req,
              res,
              {
                target
              },
              next
            );
          });
        }
      );
    } else {
      next();
    }
  };
};
