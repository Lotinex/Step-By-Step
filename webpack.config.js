const Path = require("path");

module.exports = {
    entry: {
        index: Path.resolve(__dirname, 'src/Front/index.ts'),
        game: Path.resolve(__dirname, 'src/Front/game.ts')
    },
    output: {
        path: Path.resolve(__dirname, 'dist/assets/pages')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
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