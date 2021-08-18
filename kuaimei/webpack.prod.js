/*
 * @Author: DWP
 * @Date: 2021-08-12 14:49:24
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-17 18:23:37
 */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  output: {
    publicPath: '/kuaimei/' // 静态资源CDN地址
  },
  devtool: 'cheap-module-source-map',
  mode: 'production',
  plugins: [
    new webpack.ids.HashedModuleIdsPlugin(),
    // 如果是多页面的html，则多次new HtmlWebpackPlugin
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'), // html模板，如设置该参数，则按该模板来，忽略下面的title参数
      favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
      title: 'webpack demo', // html标题
      filename: 'index.html', // 生成html的名称，默认index.html
      minify: { // 压缩，默认false
        removeAttributeQuotes: true // 移除属性的引号
      }
    })
  ]
});
