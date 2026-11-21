import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { stripVTControlCharacters } from 'node:util';

const run = (script: string, colorLevel?: string) => {
	const env = { ...process.env };
	delete env.NO_COLOR;
	delete env.NODE_DISABLE_COLORS;
	delete env.FORCE_COLOR;
	if (colorLevel !== undefined) env.FORCE_COLOR = colorLevel;

	const { stdout, stderr, status } = spawnSync(process.execPath, [
		'--input-type=module', '--eval', `import css from '@morev/console-css';\n${script}`,
	], { encoding: 'utf8', env });

	if (status !== 0) throw new Error(stderr || 'Node.js exited before producing output.');

	return { stdout, stderr };
};

describe('Node.js output', () => {
	it('Shares one instance between import and require and restores the global console', () => {
		const { stdout, stderr } = run(`
			import { createRequire } from 'node:module';
			import assert from 'node:assert/strict';
			const original = console;
			const cjs = createRequire(import.meta.url)('@morev/console-css');
			assert.equal(css, cjs);
			css.override();
			console.log('<b>%d &amp; %s</b>', 0, false, { tail: true });
			console.warn('before <img src="image.png" alt="diagram"> after');
			cjs.restore();
			assert.equal(console, original);
		`);

		expect(stdout).toBe('0 & false { tail: true }\n');
		expect(stderr).toBe('before diagram after\n');
	});

	it('Applies terminal colors, nesting and inline precedence while dropping layout properties', () => {
		const { stdout, stderr } = run(`
			css.add('.signal { color: red; background: #123456; padding: 4px; }');
			css.styled.log('<b class="signal" style="color: lime"><i>ok</i></b> plain');
			css.styled.warn('<u>note</u><s>old</s>');
		`, '3');

		expect(stdout).toContain('\u{1B}[38;2;0;255;0m');
		expect(stdout).toContain('\u{1B}[48;2;18;52;86m');
		expect(stdout).toContain('\u{1B}[1m\u{1B}[3mok');
		expect(stdout).toMatch(/m plain\n$/);
		expect(stripVTControlCharacters(stdout)).toBe('ok plain\n');
		expect(stderr).toContain('\u{1B}[4mnote');
		expect(stderr).toContain('\u{1B}[9mold');
	});
});
