const path = require('path')
const Webpack = require('webpack')

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
  target: 'node',
  output: {
    path: path.resolve(process.cwd()),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  externals: ['aws-sdk'],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
        exclude: [/node_modules/],
      },
    ]
  }
}
