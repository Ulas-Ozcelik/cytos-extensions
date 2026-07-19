const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insert: 'html',
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.html$/i,
        type: 'asset/source',
      }
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.js'],
  },
};
