const defaultOptions = {
  mode: "development",
  context: process.cwd(),
  entry: {
    path: "./src",
    common: "./src/common"
  },
  output: {
    path: "./dest",
    common: "./dest/common",
    publicPath: ""
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {}
  },
  js: {
    lint: false,
    types: ["js", "jsx"],
    sourceMap: {
      active: false,
      inline: true
    }
  },
  css: {
    sourceMap: {
      active: true,
      inline: true
    }
  },
  moduleDirectory: ["common_modules"]
};

module.exports = defaultOptions;
