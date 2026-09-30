'use strict';

const path = require('node:path');

const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const federationShared = require('../../build/federation-shared.cjs');
const pkg = require('./package.json');
// One source of truth: the build wires the remotes, the app re-registers them
// when the retry button is pressed.
const remotes = require('./src/remotes.json');

const WORKSPACE_PACKAGES = path.resolve(__dirname, '../../packages');

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    name: 'host',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      // Without this, chunks of a remote would be requested from the host origin.
      publicPath: 'auto',
      uniqueName: 'host',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          // Workspace packages ship TypeScript sources, so they are compiled here too.
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
        template: './public/index.html',
        // Absolute, otherwise a deep link such as /profile/contacts would make
        // the browser resolve <script src="main.js"> against /profile/.
        publicPath: '/',
      }),
      new ModuleFederationPlugin({
        name: 'host',
        remotes: Object.fromEntries(
          Object.entries(remotes).map(([name, remote]) => [name, `${name}@${remote.entry}`]),
        ),
        shared: federationShared(pkg),
        // Not the default ('version-first'). With identical versions on all
        // sides version-first has nothing to pick by and falls back to
        // registration order, which puts a remote's React into the share scope
        // while the host is already using its own. See docs/adr/0004.
        shareStrategy: 'loaded-first',
        dts: {
          // The host exposes nothing, it only pulls types from the remotes.
          generateTypes: false,
          consumeTypes: true,
        },
      }),
    ],
    devServer: {
      port: 3000,
      // Deep links such as /profile/contacts must reach index.html.
      historyApiFallback: true,
      hot: false,
      liveReload: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    stats: 'errors-warnings',
  };
};
