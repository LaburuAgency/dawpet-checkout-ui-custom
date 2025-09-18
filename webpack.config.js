const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      'checkout6-custom': './src/checkout6/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'checkout-ui-custom'),
      filename: '[name].js',
      clean: false
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { pragma: 'h', pragmaFrag: 'Fragment' }]
              ]
            }
          }
        },
        {
          test: /\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                api: 'modern'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      }
    },
    externals: {
      'preact': 'preact',
      'preact/hooks': 'preact/hooks'
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map'
  };
};