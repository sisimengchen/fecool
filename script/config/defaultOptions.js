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
    extensions: [".js", ".jsx", ".es6"],
    alias: {}
  },
  js: {
    lint: false,
    types: ["js", "es6", "jsx"],
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
