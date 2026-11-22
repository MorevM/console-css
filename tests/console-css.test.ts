// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConsoleCSS from '../dist/console-css.cjs';

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

	it('Reads adjacent tag and class rules without spaces before braces', () => {
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});

		ConsoleCSS.add('b{color: red}.notice{color: blue}');
		ConsoleCSS.styled.log('<b>one</b><span class="notice">two</span>');

		expect(log).toHaveBeenCalledWith(
			'%cone%c%ctwo%c', expect.stringContaining('color: red'), '', expect.stringContaining('color: blue'), '',
		);
	});

	it('Applies matching classes in source order and gives inline styles precedence', () => {
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});
		ConsoleCSS.add('.first { color: red; } .second { color: blue; }');
		ConsoleCSS.add('.first { color: green; } span { color: gray; }');

		ConsoleCSS.styled.log('<span class="second first">A</span><span class="first" style="color: purple">B</span>');

		const [, classStyle, , inlineStyle] = log.mock.calls[0];
		const { style } = document.createElement('span');
		style.cssText = classStyle;

		expect(style.color).toBe('green');

		style.cssText = inlineStyle;

		expect(style.color).toBe('purple');
	});

	it('Keeps only the last occurrence of a repeated CSS block', () => {
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});
		ConsoleCSS.add('.notice { color: red } .notice { color: blue }');
		ConsoleCSS.add('.notice { color: red }');

		ConsoleCSS.styled.log('<span class="notice">ok</span>');

		expect(log).toHaveBeenCalledWith('%cok%c', 'color: blue;color: red', '');
	});

	it('Passes timer labels and calls without arguments through override', () => {
		const timer = vi.spyOn(window.console, 'time').mockImplementation(() => {});
		const end = vi.spyOn(window.console, 'groupEnd').mockImplementation(() => {});
		const log = vi.spyOn(window.console, 'log').mockImplementation(() => {});
		ConsoleCSS.override();

		window.console.time('load');
		window.console.groupEnd();
		window.console.log();

		expect(timer).toHaveBeenCalledWith('load');
		expect(end).toHaveBeenCalledWith();
		expect(log).toHaveBeenCalledWith();
	});

	it('Formats assertion messages after the condition', () => {
		const assertion = vi.spyOn(window.console, 'assert').mockImplementation(() => {});
		ConsoleCSS.override();

		window.console.assert(false, '<b>failed %d</b>', 0);
		window.console.assert(false);

		expect(assertion).toHaveBeenNthCalledWith(1, false, '%cfailed %d%c', 'font-weight: bold', 0, '');
		expect(assertion).toHaveBeenNthCalledWith(2, false);
	});
});
