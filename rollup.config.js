import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import typescript from "@rollup/plugin-typescript"
import svelte from "rollup-plugin-svelte"
import { terser } from "rollup-plugin-terser"
import config from "sapper/config/rollup"
import sveltePreprocess from "svelte-preprocess"
import pkg from "./package.json"

const preprocess = [
    sveltePreprocess({
        defaults: {
            script: "typescript"
        }
    })
]

const mode = process.env.NODE_ENV
const dev = mode === "development"
const sourcemap = dev ? "inline-source-map" : false

const onwarn = (warning, onWarn) =>
    (warning.code === "MISSING_EXPORT" && /'preload'/.test(warning.message)) ||
    (warning.code === "CIRCULAR_DEPENDENCY" &&
        /[/\\]@sapper[/\\]/.test(warning.message)) ||
    onWarn(warning)

export default {
    client: {
        input: config.client.input().replace(/\.js$/, ".ts"),
        output: { ...config.client.output(), sourcemap },
        plugins: [
            replace({
                "process.browser": true,
                "process.env.NODE_ENV": JSON.stringify(mode)
            }),
            svelte({
                dev,
                hydratable: true,
                emitCss: true,
                preprocess
            }),
            resolve({
                browser: true,
                dedupe: ["svelte"]
            }),
            typescript({
                noEmitOnError: !dev,
                sourceMap: !!sourcemap
            }),
            !dev &&
                terser({
                    module: true
                })
        ],
        preserveEntrySignatures: false,
        onwarn
    },
    server: {
        input: { server: config.server.input().server.replace(/\.js$/, ".ts") },
        output: { ...config.server.output(), sourcemap },
        plugins: [
            replace({
                "process.browser": false,
                "process.env.NODE_ENV": JSON.stringify(mode)
            }),
            svelte({
                generate: "ssr",
                dev,
                preprocess
            }),
            resolve({
                dedupe: ["svelte"]
            }),
            typescript({
                noEmitOnError: !dev,
                sourceMap: !!sourcemap
            })
        ],
        external: Object.keys(pkg.dependencies).concat(
            require("module").builtinModules ||
                Object.keys(process.binding("natives"))
        ),
        preserveEntrySignatures: "strict",
        onwarn
    }
}
