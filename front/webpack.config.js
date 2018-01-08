const path = require('path')

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },

  resolve: {
    modules: ['./src', 'node_modules'],
    extensions: ['.js', 'jsx']
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [/node_modules/, /assets/],
      loader: 'babel-loader',
      include: __dirname,
      query: {
        presets: [ 'es2015', 'react' ],
        plugins: ['transform-class-properties', 'transform-object-rest-spread']
      }
    },
    {
      test: /\.(gif|png|jpe?g|svg)$/i,
      use: ['file-loader', {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
              quality: 65
            },
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: '65-90',
              speed: 4
            },
            gifsicle: {
              interlaced: false,
            },
          }
        },
      ],
      exclude: /node_modules/,
      include: __dirname,
    },
    { test: /\.css$/, loader: 'style-loader!css-loader' }]
  }
}
