import { describe, expect, it, vi } from 'vitest';
import ConsoleCSS from '@morev/console-css';

describe('ConsoleCSS', () => {
	it('Applies custom CSS through the browser console and restores the original', () => {
		const original = window.console;
		const log = vi.spyOn(original, 'log').mockImplementation(() => {});

		try {
			ConsoleCSS.add('.notice { color: red; }');
			ConsoleCSS.override();
			window.console.log('<span class="notice">Hello</span>');

			expect(log).toHaveBeenCalledWith('%cHello%c', expect.stringContaining('color: red'), '');
		} finally {
			ConsoleCSS.restore();
			ConsoleCSS.reset();
			log.mockRestore();
		}

		expect(window.console).toBe(original);
	});
});
