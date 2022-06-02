const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    mode: 'development',
    cache: false,
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
        clean: true
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css?$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                use: 'shader-loader',
            },
            {
                test: /\.(png|jpe?g|gif|ico|mp3|wav)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Output Management",
            template: "src/index.html"
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000
    },
};