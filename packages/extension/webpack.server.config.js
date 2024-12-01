const path = require('node:path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/server/server.ts',
  mode: 'development',
  externals: {
    ...nodeExternals(),
    vscode: 'commonjs vscode',
    fsevents: 'commonjs fsevents'
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist', 'server'),
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
