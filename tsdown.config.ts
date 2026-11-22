import { defineConfig } from 'tsdown';

export default defineConfig([{
	entry: { 'console-css': 'src/index.ts' },
	platform: 'neutral',
	deps: { onlyBundle: ['@morev/utils'] },
	target: 'es2020',
	format: {
		esm: {},
		cjs: {},
		umd: { dts: false },
	},
	globalName: 'ConsoleCSS',
	dts: true,
	minify: true,
	outExtensions: ({ format }) => format === 'es' ? { js: '.es.js', dts: '.ts' } : undefined,
}, {
	entry: { node: 'src/node.ts' },
	platform: 'node',
	deps: { onlyBundle: ['@morev/utils'] },
	format: 'cjs',
	target: 'node20',
	dts: false,
	minify: true,
}]);
