const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //

module.exports = {
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'css-hot-loader', // 热更新
          MiniCssExtractPlugin.loader, // 分离css
          {
            loader: 'css-loader',
            options: {
              modules: true // css module
            }
          },
          'postcss-loader'
        ],
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        // 引入antd样式
        test: /\.css$/,
        exclude: /src/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          }
        ]
      },
      {
        // 定制antd主题
        test: /\.less$/,
        include: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader, // 分离css
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              modifyVars: {
                'primary-color': 'black'
              },
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.less/,
        use: [
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'postcss-loader',
          'less-loader'
        ],
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        test: /\.(sc|sa)ss/,
        use: [
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          'postcss-loader',
          'sass-loader'
        ],
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        test: /\.js[x]?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        /*
          * 图片打包
          * 图片小于limit参数时，使用url-loader，把图片BASE64编码
          * 图片大于limit参数时，默认使用file-loader拷贝图片
          */
        test: /\.(png|jpg|jpeg|git|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: 'static/[name].[hash:7].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      static: path.resolve(__dirname, 'static')
    }
  },
  plugins: [
    // 分离css
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new webpack.ProvidePlugin({
      _: 'lodash' // 所有页面都引入 _ 变量，不用再import
    })
  ]
};
