/*
 * @Author: DWP
 * @Date: 2021-08-12 14:49:24
 * @LastEditors: DWP
 * @LastEditTime: 2021-08-13 15:01:38
 */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  output: {
    publicPath: '/'
  },
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    proxy: [{
      context: ['/php', '/imgs'],
      target: 'http://yingtianmeijie.com', // 接口的域名
      changeOrigin: true // 如果接口跨域，需要进行这个参数配置
    }],
    port: 8080, // 端口，默认8080
    hot: true, // 热加载
    historyApiFallback: {
      // html5 history模式
      rewrities: [{ from: /.*/, to: path.resolve(__dirname, 'public', 'index.html') }]
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'), // html模板，如设置该参数，则按该模板来，忽略下面的title参数
      filename: 'index.html',
      title: 'webpack demo',
      // favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
      hash: true,
      chunks: ['index']
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
});
