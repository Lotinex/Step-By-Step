const Path = require("path");
const webpack = require("webpack");
const Child_process = require("child_process");

module.exports = {
    entry: {
        index: Path.resolve(__dirname, 'src/Front/index.ts'),
        game: Path.resolve(__dirname, 'src/Front/game.ts')
    },
    output: {
        path: Path.resolve(__dirname, 'dist/assets/pages')
    },
    devtool: 'source-map',
    /*
    plugins: [
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
            Child_process.exec('start cmd.exe /K npm run watch-back')
          })
        }
      }
    ],*/
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'source-map-loader',
                enforce: 'pre' 
            },
            {
                test: /\.ts$/,
                enforce: "pre",
                use: [
                  {
                    loader: "eslint-loader",
                    options: {
                      emitError: true,
                      fix: true
                    }
                  }
                ]
            },
            {
                test: /\.ts$/,
                use: [
                  {
                    loader: "ts-loader",
                    options: {
                      transpileOnly: true
                    }
                  }
                ]
            }
        ]
    }
}