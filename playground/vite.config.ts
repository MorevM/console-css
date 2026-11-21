import { defineConfig } from 'vite';
import { comparisonPath, printComparison } from './comparison.js';

export default defineConfig({
	plugins: [{
		name: 'console-css-terminal-comparison',
		configureServer(server) {
			server.middlewares.use((request, response, next) => {
				if (request.url !== comparisonPath) return next();
				if (request.method !== 'POST') {
					response.writeHead(405, { Allow: 'POST' }).end();
					return;
				}
				printComparison();
				response.writeHead(204).end();
			});
		},
	}],
});
