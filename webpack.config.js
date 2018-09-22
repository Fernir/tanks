const path = require('path');
const os = require('os');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsParallelPlugin = require('webpack-uglify-parallel');

const plugins = [
  new MiniCssExtractPlugin({
    filename: 'styles.css?[hash]'
  }),
  new webpack.DefinePlugin({
    'process.env': {
      BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      context: __dirname
    }
  }),
  new CleanWebpackPlugin([path.join(__dirname, 'js')])
  // new UglifyJsParallelPlugin({
  //   workers: os.cpus().length,
  //   mangle: true,
  //   compress: {
  //     warnings: false, // Suppress uglification warnings
  //     sequences: true,
  //     dead_code: true,
  //     conditionals: true,
  //     booleans: true,
  //     unused: true,
  //     if_return: true,
  //     join_vars: true,
  //     drop_console: true
  //   }
  // })
];

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    'babel-polyfill': 'babel-polyfill',
    bundle: './src/index.js'
  },
  output: {
    path: path.join(__dirname, './src/js'),
    filename: '[name].js',
    chunkFilename: 'app-[name]-[chunkhash].js',
    publicPath: '/js/',
    jsonpFunction: 'omWebpackJsonp'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: {importLoaders: 1}},
          'postcss-loader',
          'sass-loader'
          // {
          //   loader: 'sass-resources-loader',
          //   options: {
          //     resources: [
          //       path.join(__dirname, 'src/scss/variables/**/*.scss')
          //     ]
          //   }
          // }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bundle)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', ['env', {
              targets: {
                browsers: ['ie >= 11']
              },
              useBuiltIns: true
            }]],
            plugins: [
              ['transform-object-rest-spread',
                {
                  useBuiltIns: true
                }
              ],
              'transform-decorators-legacy',
              'transform-class-properties',
              'syntax-dynamic-import'
            ]
          }
        }
      },
      {
        test: /\.(png|gif|jpg|jpe?g|woff|woff2)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 0
            }
          }]
      },
      {
        test: /\.(svg)$/i,
        use: ['babel-loader?presets[]=es2015,presets[]=react', 'react-svg-loader']
      }]
  },
  plugins
};
