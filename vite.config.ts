import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [dts({
		include: 'src/index.ts',
	})],
	server: { port: 3000 },
	define: {},
	css: {},
	build: {
		minify: 'terser',
		lib: {
			entry: 'src/index.ts',
			formats: ['es', 'cjs', 'umd'],
			name: 'ConsoleCSS',
			fileName: (format) => `console-css.${format}.js`,
		},
		rollupOptions: {
			output: {
				dir: 'dist',
				globals: {},
			},
		},
	},
});
