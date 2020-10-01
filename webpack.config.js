const Path = require("path");

module.exports = {
    entry: {
        index: Path.resolve(__dirname, 'src/Front/index.ts'),
        game: Path.resolve(__dirname, 'src/Front/game.ts')
    },
    output: {
        path: Path.resolve(__dirname, 'dist/assets/pages')
    },
    devtool: 'inline-source-map',
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
                    loader: "ts-loader"
                  }
                ]
            }
        ]
    }
}