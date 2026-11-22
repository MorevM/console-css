import { describe, expect, it } from 'vitest';
import { CommitParser } from 'conventional-commits-parser';
import config from '../scripts/release-changelog.js';

const { whatBump, writerOpts } = config.plugins['@release-it/conventional-changelog'];
const parser = new CommitParser();

describe('Release history', () => {
	it('Uses the strongest change in an untyped GitHub squash and lists the PR once', () => {
		const commit = parser.parse([
			'Fix package types and add styled Node.js console output (#1)',
			'',
			'* fix: Export matching declarations',
			'',
			'* feat: Render styled console messages in Node.js',
		].join('\n'));

		expect(whatBump([commit]).level).toBe(1);
		expect(writerOpts.transform(commit, {})).toMatchObject({
			type: 'Features',
			subject: expect.stringContaining('Fix package types and add styled Node.js console output'),
		});
	});

	it('Uses the conventional PR title when its body mentions another change', () => {
		const commit = parser.parse('fix: Restore colors (#2)\n\n* feat: An earlier experiment');

		expect(whatBump([commit]).level).toBe(2);
		expect(writerOpts.transform(commit, {}).type).toBe('Bug fixes');
	});

	it('Omits the version heading when there are no changes to release', () => {
		expect(whatBump([])).toBeNull();
		expect(writerOpts.headerPartial({ version: null })).toBe('');
	});
});
