import resolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";
import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
	input: "./src/index.ts",
	// Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
	// https://rollupjs.org/guide/en#external-e-external
	external: ["oasis-engine"],

	plugins: [
		// Allows node_modules resolution
		resolve({ extensions }),

		// Compile TypeScript/JavaScript files
		swc(
			defineRollupSwcOption({
				include: /\.[mc]?[jt]sx?$/,
				exclude: /node_modules/,
				jsc: {
					loose: true,
					externalHelpers: true
				},
				sourceMaps: true
			})
		),
	],

	output: [
		{
			file: pkg.module,
			format: "es",
			sourcemap: true
		},
		{
			file: pkg.browser,
			format: "umd",
			name: "@oasisEngine/baker",
			globals: {
				"oasis-engine": "oasisEngine",
			},
		},
	],
};
