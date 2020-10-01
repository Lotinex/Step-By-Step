const Path = require("path");
const NodeExternals = require("webpack-node-externals");
module.exports = {
    entry: {
        web: Path.resolve(__dirname, 'src/Back/Web/Main.ts'),
        game: Path.resolve(__dirname, 'src/Back/Game/Main.ts')
    },
    output: {
        path: Path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    target : 'node',
    node: {
        __dirname: false
    },
    module: {
        rules: [
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
                    loader: "ts-loader"
                  }
                ]
            }
        ]
    },
    externals: [
        NodeExternals()
      ]
}