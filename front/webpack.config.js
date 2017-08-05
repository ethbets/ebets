var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    publicPath: '/dist/'
  },

  resolve: {
    modules: ['./src', 'node_modules'],
    extensions: ['.js']
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [/node_modules/, /assets/],
      loader: 'babel-loader',
      include: __dirname,
      query: {
        presets: [ 'es2017', 'react'],
        plugins: ['transform-class-properties', 'transform-object-rest-spread']
      }
    },
    {
      test: /\.(gif|png|jpe?g|svg)$/i,
      loaders: [
        'file-loader',
        {
          loader: 'image-webpack-loader',
          query: {
            progressive: true,
            //optimizationLevel: 7,
            //interlaced: false,
          }
        }
      ]
    }]
  }
}
