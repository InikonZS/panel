const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")

esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: "dist/panel.js",
    platform: "node",
    target: "node14",
    bundle: true,
    minify: true
})
.then(() => {
    console.log("esbuild: builded :)")
})
.catch((e) => {
    console.log("esbuild: something went wrong...", e)
})
