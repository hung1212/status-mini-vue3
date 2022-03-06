import pkg from './package.json'
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve"
import common from '@rollup/plugin-commonjs'
export default {
    input: './src/index.ts',
    output: [
        {
            name: "vue",
            file: pkg.module,
            format: 'esm'
        },
        {
            file: pkg.main,
            format: 'cjs'
        }
    ],
    plugins:[
        common(),
        resolve(),
        typescript()
    ]
}