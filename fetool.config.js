const config = {
  mode: "development",
  context: process.cwd(),
  entry: {
    path: './src',
    common: './src/m/common'
  },
  output: {
    path: './dest',
    common: './dest/m/common',
    publicPath: 'http://feresource.com:8092'
  },
  resolve: {
    extensions: [".js", ".jsx", ".es6"],
    alias: {
      'api': './src/m/api',
      'channel_module': './src/m/channel_module',
      'channel_page': './src/m/channel_page',
      'channel_util': './src/m/channel_util',
      'common': './src/m/common',
      'config': './src/m/config',
      'resource': './src/m/resource',
      'test': './src/m/test',
      'ui': './src/m/ui',
      'util': './src/m/util'
    }
  },
  js: {
    lint: false,
    types: ['js', 'es6', 'jsx'],
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
  }
}

module.exports = config;
