import { isElement, isFunction, isServer, isString, tsObject } from '@morev/utils';
import { formatImages } from './utils';
import type { Declaration } from './types';

class ConsoleCSS {
	#declarations: Declaration[] = [];

	#originalConsole = console;

	#isOverride: boolean = false;

	#elementStyle(node: Element, inheritedStyle: string) {
		const styles = [inheritedStyle];
		switch (node.localName) {
			case 'b': styles.push('font-weight: bold'); break;
			case 'i': styles.push('font-style: italic'); break;
			case 'u': styles.push('text-decoration: underline'); break;
			case 's': styles.push('text-decoration: line-through'); break;
			default: break;
		}

		const classStyles: string[] = [];
		for (const { type, entity, cssText } of this.#declarations) {
			if (type === 'tag' && node.localName === entity) styles.push(cssText);
			if (type === 'class' && node.classList.contains(entity)) classStyles.push(cssText);
		}
		styles.push(...classStyles);
		if (node instanceof HTMLElement) styles.push(node.style.cssText);

		return styles.filter(Boolean).join(';');
	}

	#style(message: unknown, ...rest: unknown[]) {
		if (!isString(message)) return [message, ...rest];

		const template = document.createElement('template');
		template.innerHTML = message;
		formatImages(template.content);

		const substitutions: unknown[] = [];
		const render = (parent: ParentNode, style: string): string => {
			let format = '';
			for (const child of parent.childNodes) {
				if (isElement(child)) {
					format += render(child, this.#elementStyle(child, style));
					continue;
				}
				if (child.nodeType !== Node.TEXT_NODE) continue;

				substitutions.push(style);
				const content = (child.textContent ?? '').replaceAll(/%%|%[Ocdfios]|%\.\d+[dfi]/g, (token) => {
					if (token === '%%') return token;
					if (!rest.length) return '';
					substitutions.push(rest.shift());
					return token;
				});
				substitutions.push('');
				format += `%c${content}%c`;
			}
			return format;
		};

		const format = render(template.content, '');
		return [format, ...substitutions, ...rest];
	}

	#map() {
		const original = this.#originalConsole;
		const styled = { ...original };
		for (const [method, callback] of tsObject.entries(original)) {
			if (!isFunction(callback)) continue;
			Reflect.set(styled, method, (message?: unknown, ...rest: unknown[]) =>
				Reflect.apply(callback, original, this.#style(message, ...rest)));
		}
		return styled;
	}

	/**
	 * Overrides the `window.console` with `ConsoleCSS` to allow usage
	 * of native `window.console` methods directly with custom CSS styles applied.
	 *
	 * @example
	 *  ConsoleCSS.override();
	 *  console.log('<span class="styled">Styled</span> message via native `console.log`');
	 */
	public override() {
		if (this.#isOverride || isServer()) return;
		this.#isOverride = true;
		this.#originalConsole = window.console;
		window.console = this.#map();
	}

	/**
	 * Restores the original `window.console` methods.
	 *
	 * @example
	 *  ConsoleCSS.override();
	 *  console.log('<span class="styled">Styled</span> message via native `console.log`');
	 *  ConsoleCSS.restore();
	 *  console.log('<b>No more</b> styled output :(');
	 */
	public restore() {
		if (!this.#isOverride || isServer()) return;
		this.#isOverride = false;
		window.console = this.#originalConsole;
	}

	/**
	 * Resets all previously added custom CSS rules.
	 *
	 * @example
	 *  ConsoleCSS.add('b { color: red; }');
	 *  ConsoleCSS.styled.log('<b>Bold red text</b>');
	 *  ConsoleCSS.reset();
	 *  ConsoleCSS.styled.log('<b>Just bold text</b>');
	 */
	public reset() {
		this.#declarations = [];
	}

	/**
	 * Adds custom CSS rules to the current set.
	 *
	 * @example
	 *  ConsoleCSS.add(`
	 *    b { color: red; }
	 *    .block {
	 *      color: blue;
	 *      padding: 2px 4px;
	 *      font-size: 12px;
	 *    }
	 *  `);
	 *  ConsoleCSS.styled.log('<span class="block">Some block</span>');
	 *  ConsoleCSS.styled.log('<b>Bold red text</b>');
	 *
	 * @param   input   CSS-like string with custom rules.
	 */
	public add(input: string) {
		for (const [, selector, block] of input.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
			const name = selector.trim();
			const cssText = block.trim();
			if (!name || !cssText) continue;

			const type = name.startsWith('.') ? 'class' : 'tag';
			const entity = type === 'class' ? name.slice(1) : name.toLowerCase();
			this.#declarations.push({ type, entity, cssText });
		}
	}

	/**
	 * Mappings of original `window.console` methods with custom styles allowed.
	 *
	 * @returns   Mappings of original `window.console` methods.
	 */
	public get styled(): Console {
		return isServer() ? console : this.#map();
	}
}

export default new ConsoleCSS();
