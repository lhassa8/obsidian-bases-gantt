import esbuild from "esbuild";
import process from "process";
import fs from "fs";
import path from "path";

const prod = process.argv[2] === "production";

// Plugin to handle CSS imports in JS by replacing them with empty modules
const cssImportPlugin = {
	name: "css-import",
	setup(build) {
		build.onResolve({ filter: /\.css$/ }, (args) => {
			return { path: args.path, namespace: "css-stub" };
		});
		build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => {
			return { contents: "", loader: "js" };
		});
	},
};

// JS build
const jsContext = await esbuild.context({
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
	format: "cjs",
	target: "es2022",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
	minify: prod,
	plugins: [cssImportPlugin],
});

// CSS build
const cssContext = await esbuild.context({
	entryPoints: ["src/styles/main.css"],
	bundle: true,
	logLevel: "info",
	outfile: "styles.css",
	minify: prod,
});

if (prod) {
	await jsContext.rebuild();
	await cssContext.rebuild();
	await jsContext.dispose();
	await cssContext.dispose();
} else {
	await jsContext.watch();
	await cssContext.watch();
}
