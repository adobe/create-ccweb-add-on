const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isEnvProduction = process.env.NODE_ENV === "production";

const uiPath = path.resolve(__dirname, "./src/ui");
const scriptPath = path.resolve(__dirname, "./src/script");

module.exports = {
    mode: isEnvProduction ? "production" : "development",
    devtool: "source-map",
    entry: {
        index: "./src/ui/index.ts",
        code: "./src/script/code.ts"
    },
    experiments: {
        outputModule: true
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        module: true,
        filename: "[name].js"
    },
    externalsType: "module",
    externalsPresets: { web: true },
    externals: {
        AddOnScriptSdk: "AddOnScriptSdk",
        express: "express"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html",
            scriptLoading: "module",
            excludeChunks: ["code"]
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: "src/*.json", to: "[name][ext]" }]
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: path.resolve(uiPath, "tsconfig.json")
                        }
                    }
                ],
                include: uiPath,
                exclude: /node_modules/
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: path.resolve(scriptPath, "tsconfig.json")
                        }
                    }
                ],
                include: scriptPath,
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};
