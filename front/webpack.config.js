const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: path.join(__dirname, './public/index.html'),
  filename: 'index.html',
  inject: 'body'
});

const BUILD_DIR = path.resolve(__dirname, 'dist');

const config = {
  entry: [
    path.join(__dirname, '/src/index.js'),
  ],
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? "warning" : false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader?cacheDirectory"
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [{
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src/assets/imgs'),
      }
    ]
  },
  plugins:[HTMLWebpackPluginConfig]
};
module.exports = config;