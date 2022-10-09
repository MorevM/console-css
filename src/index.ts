import type { NonEmptyArray, ObjectKeys } from '@morev/helpers';
import { isServer, isClient, arrayUnique, isString } from '@morev/helpers';
import type { CleanConsole, Declaration } from './types';
import { replaceBetween, getChildNodes, formatImages } from './utils';

class ConsoleCSS {
	#declarations: Declaration[] = [];

	#originalConsole: Console | null = isClient() ? window.console : null;

	#restParams: any[] = [];

	#isOverride: boolean = false;

	#substitutions: string[] = [];

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
		window.console = this.#originalConsole as Console;
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
	 * Adds a potion of custom CSS rules. \
	 * Can be used multiple times.
	 *
	 * @param   input   CSS-like string with custom rules.
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
	 */
	public add(input: string) {
		(input.match(/.+?\s{.+?}/gs) ?? []).map(i => i.replace(/\s+/g, ' '))
			.forEach(declaration => {
				const [_, _entity, _rules] = (declaration.match(/(.*){(.*)}/) ?? []).map(i => i.trim());
				if (!_entity || !_rules) return;

				const type = _entity.startsWith('.') ? 'class' : 'tag';
				const entity = _entity.startsWith('.') ? _entity.slice(1) : _entity.toLowerCase();
				const rules = arrayUnique(_rules.split(';').map(r => r.trim()).filter(Boolean));

				const alreadyCreated = this.#declarations
					.find(d => d.type === type && d.entity === entity);

				if (alreadyCreated) {
					alreadyCreated.rules.push(...rules);
					return;
				}

				this.#declarations.push({ type, entity, rules });
			});
	}

	/**
	 * Mappings of original `window.console` methods with custom styles allowed.
	 *
	 * @returns   Mappings of original `window.console` methods.
	 */
	public get styled() {
		return isServer() ? console : this.#map();
	}

	#applyStyles(node: Element) {
		if (!this.#declarations.length || node.nodeType === 3) return [];
		const [tagName, classNames] = [node.nodeName.toLowerCase(), [...node.classList]];
		const rulesFromTag = this.#declarations
			.filter(d => d.type === 'tag' && d.entity === tagName)
			.reduce<string[]>((acc, d) => [...acc, ...d.rules], []);
		const rulesFromClassnames = this.#declarations
			.filter(d => d.type === 'class' && classNames.includes(d.entity))
			.reduce<string[]>((acc, d) => [...acc, ...d.rules], []);

		return [...rulesFromTag, ...rulesFromClassnames];
	}

	#parseNode(html: string, inheritedStyles = ''): string {
		if (!isString(html)) return html;
		html = formatImages(html);
		const children = getChildNodes(html);

		if (children.length === 1 && children[0].nodeType === 3) {
			this.#substitutions.push(inheritedStyles);
			let content = children[0].textContent ?? '';
			const substitutionsInside = [...content.matchAll(/%[Odfios]|%\.\d+[dfi]/g)];
			let difference = 0;
			substitutionsInside.forEach((match) => {
				const substitution = this.#restParams.shift();
				if (substitution) {
					this.#substitutions.push(substitution);
				} else {
					content = replaceBetween(content, match.index! - difference, match.index! - difference + match[0].length);
					difference += match[0].length;
				}
			});
			this.#substitutions.push('');
			return `%c${content}%c`;
		}

		return children.reduce<string>((acc, child) => {
			if (child.nodeType !== 1 && child.nodeType !== 3) return acc;

			const childStyle = inheritedStyles.split(';');
			if (child instanceof HTMLElement) {
				child.style.cssText && childStyle.push(...child.style.cssText.split(';').map(i => i.trim()));
			}

			switch (child.nodeName.toLowerCase()) {
				case 'b': childStyle.unshift('font-weight: bold'); break;
				case 'i': childStyle.unshift('font-style: italic'); break;
				case 'u': childStyle.unshift('text-decoration: underline'); break;
				case 's': childStyle.unshift('text-decoration: line-through'); break;
				default: break;
			}

			childStyle.push(...this.#applyStyles(child));

			return acc + this.#parseNode(
				child.innerHTML || (child.textContent ?? ''),
				childStyle.join(';'),
			);
		}, '');
	}

	#style(message: string, ...rest: any[]) {
		this.#restParams = rest;
		const result = [this.#parseNode(message, ''), ...this.#substitutions];
		this.#substitutions = [];
		return [...result, ...this.#restParams];
	}

	#map() {
		return (Object.keys(this.#originalConsole!) as ObjectKeys<CleanConsole>).reduce((acc, method) => {
			/* @ts-expect-error -- `clear`, `groupEnd` expect no arguments, but it doesn't matters */
			acc[method] = (...args: NonEmptyArray) => {
				this.#originalConsole![method].apply(this, this.#style.apply(this, args)); // eslint-disable-line prefer-spread
			};
			return acc;
		}, {} as Console); // eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter
	}
}

export default new ConsoleCSS();
