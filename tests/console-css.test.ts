import { afterEach, describe, expect, it, vi } from 'vitest';
import ConsoleCSS from '@morev/console-css';

describe('ConsoleCSS', () => {
	afterEach(() => {
		ConsoleCSS.restore();
		ConsoleCSS.reset();
		vi.restoreAllMocks();
	});

	it('Applies custom CSS through the browser console and restores the original', () => {
		const original = window.console;
		const log = vi.spyOn(original, 'log').mockImplementation(() => {});

		ConsoleCSS.add('.notice { color: red; }');
		ConsoleCSS.override();
		window.console.log('<span class="notice">Hello</span>');

		expect(log).toHaveBeenCalledWith('%cHello%c', expect.stringContaining('color: red'), '');

		ConsoleCSS.restore();

		expect(window.console).toBe(original);
	});

	it('Preserves falsy substitutions and trailing arguments', () => {
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});

		ConsoleCSS.styled.log('%%s %d %o %s %o %o', 0, false, '', null, undefined, 'tail');

		expect(log).toHaveBeenCalledWith('%c%%s %d %o %s %o %o%c', '', 0, false, '', null, undefined, '', 'tail');
	});

	it('Keeps escaped tags literal beside a styled element', () => {
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});

		ConsoleCSS.styled.log('given &lt;b&gt; then <i>end</i>');

		expect(log).toHaveBeenCalledWith('%cgiven <b> then %c%cend%c', '', '', expect.stringContaining('italic'), '');
	});

	it('Keeps text around multiple images and preserves their individual styles', () => {
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});

		const first = '<img src="first?a=b" width="10" height="8">';
		const second = '<img src="second" width="20" height="6"/>';
		ConsoleCSS.styled.log(`A${first}B${second}C`);

		expect(log).toHaveBeenCalledWith(
			'%cA%c%c %c%cB%c%c %c%cC%c',
			'',
			'',
			expect.stringContaining('first?a=b'),
			'',
			'',
			'',
			expect.stringContaining('second'),
			'',
			'',
			'',
		);
	});
});
