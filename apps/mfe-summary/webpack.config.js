'use strict';

const path = require('node:path');

const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const federationShared = require('../../build/federation-shared.cjs');
const pkg = require('./package.json');

const WORKSPACE_PACKAGES = path.resolve(__dirname, '../../packages');

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    name: 'summary',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
      uniqueName: 'summary',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: [path.resolve(__dirname, 'src'), WORKSPACE_PACKAGES],
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: { react: { runtime: 'automatic', development: !isProduction } },
                target: 'es2022',
              },
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            'css-loader',
            { loader: '@tailwindcss/webpack', options: { base: __dirname } },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        // Only affects the standalone page: absolute, so a deep link works.
        // The runtime public path stays 'auto' for the federated case.
        template: './public/index.html',
        publicPath: '/',
      }),
      new ModuleFederationPlugin({
        name: 'summary',
        filename: 'remoteEntry.js',
        exposes: {
          './SummaryCard': './src/SummaryCard.tsx',
        },
        shared: federationShared(pkg),
        // Not the default ('version-first'). With identical versions on all
        // sides version-first has nothing to pick by and falls back to
        // registration order, which puts a remote's React into the share scope
        // while the host is already using its own. See docs/adr/0004.
        shareStrategy: 'loaded-first',
        dts: {
          generateTypes: {
            // The type generator compiles only the exposed files, so ambient
            // declarations have to be handed to it explicitly.
            additionalFilesToCompile: [path.resolve(__dirname, 'src/globals.d.ts')],
          },
          consumeTypes: false,
        },
      }),
    ],
    devServer: {
      port: 3002,
      historyApiFallback: true,
      hot: false,
      liveReload: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    stats: 'errors-warnings',
  };
};
