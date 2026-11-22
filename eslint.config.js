import { combine, defineConfiguration, defineIgnores } from '@morev/eslint-config';

export default combine([
	defineIgnores(),
	defineConfiguration('javascript'),
	defineConfiguration('browser', { files: ['src/**/*.ts', 'tests/**/*.test.ts'] }),
	defineConfiguration('node', { files: ['*.config.*', '.commitlintrc.cjs'] }),
	defineConfiguration('html'),
	defineConfiguration('json'),
	defineConfiguration('yaml'),
	defineConfiguration('typescript'),
	defineConfiguration('vitest'),
]);
