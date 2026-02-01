const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').BuildOptions}
 */
const options = {
  entryPoints: ["./src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode", "esbuild"], // Exclude vscode (env) and esbuild (runtime dep)
  format: "cjs",
  platform: "node",
  sourcemap: !production,
  minify: production,
  target: ['node16'], // VS Code usually runs on Node 16+
  logLevel: "silent",
};

async function main() {
  const ctx = await esbuild.context(options);
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
