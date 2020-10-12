const path = require("path")
const { HotModuleReplacementPlugin, DefinePlugin } = require("webpack")
const sveltePreprocess = require("svelte-preprocess")
const { ESBuildPlugin } = require("esbuild-loader")
const config = require("sapper/config/webpack")
const pkg = require("./package.json")

const mode = process.env.NODE_ENV
const dev = mode === "development"

const alias = {
    "@": path.resolve("src"),
    svelte: path.resolve("node_modules", "svelte")
}

const extensions = [".mjs", ".js", ".ts", ".json", ".svelte", ".html"]
const mainFields = ["svelte", "module", "browser", "main"]

module.exports = {
    client: {
        entry: { main: config.client.entry().main.replace(/\.js$/, ".ts") },
        output: config.client.output(),
        resolve: { alias, extensions, mainFields },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: "esbuild-loader"
                },
                {
                    test: /\.ts$/,
                    loader: "esbuild-loader",
                    options: {
                        loader: "ts"
                    }
                },
                {
                    test: /\.(svelte|html)$/,
                    use: {
                        loader: "svelte-loader-hot",
                        options: {
                            dev,
                            hydratable: true,
                            preprocess: sveltePreprocess(),
                            hotReload: true
                        }
                    }
                }
            ]
        },
        mode,
        plugins: [
            ...(dev ? [new HotModuleReplacementPlugin()] : []),
            new DefinePlugin({
                "process.browser": true,
                "process.env.NODE_ENV": JSON.stringify(mode)
            }),
            new ESBuildPlugin()
        ],
        devtool: dev && "inline-source-map"
    },
    server: {
        entry: { server: config.server.entry().server.replace(/\.js$/, ".ts") },
        output: config.server.output(),
        target: "node",
        resolve: { alias, extensions, mainFields },
        externals: Object.keys(pkg.dependencies).concat("encoding"),
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: "esbuild-loader"
                },
                {
                    test: /\.ts$/,
                    loader: "esbuild-loader",
                    options: {
                        loader: "ts"
                    }
                },
                {
                    test: /\.(svelte|html)$/,
                    use: {
                        loader: "svelte-loader-hot",
                        options: {
                            css: false,
                            generate: "ssr",
                            hydratable: true,
                            preprocess: sveltePreprocess(),
                            dev
                        }
                    }
                }
            ]
        },
        mode,
        plugins: [new ESBuildPlugin()]
    }
}
