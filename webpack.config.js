'use strict';

const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tactile-core.js',
    libraryTarget: 'umd',
    library: 'Tactile',
  },
  externals: [
    'immutable',
    'redux',
    'shortid',
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'es2017'],
            plugins: [require('babel-plugin-transform-object-rest-spread')],
          },
        },
      },
    ],
  },
};
