const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
  	app: './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
  	new CleanWebpackPlugin(['dist']),
  	new HtmlWebpackPlugin({
  		title: 'Neighborhood Map',
  		meta: {
  			viewport: 'width=device-width, initial-scale=1'
  		}
  	}),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: '[name].bundle.js',
    chunckFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
