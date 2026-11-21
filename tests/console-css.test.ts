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
});
