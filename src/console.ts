import { isFunction, isString } from '@morev/utils';
import type { ConsoleCSS, Declaration, ElementStyle, FormatMessage } from './types';

const MESSAGE_METHODS = ['debug', 'error', 'group', 'groupCollapsed', 'info', 'log', 'trace', 'warn', 'assert'] as const;

export const createConsoleCSS = (
	format: FormatMessage,
	getHost: () => { console: Console } | undefined,
): ConsoleCSS => {
	const declarations = new Map<string, Declaration>();
	let original: Console | undefined;

	const elementStyle: ElementStyle = (tag, classes, inheritedStyle, inlineStyle) => {
		const styles = [inheritedStyle];
		switch (tag) {
			case 'b': styles.push('font-weight: bold'); break;
			case 'i': styles.push('font-style: italic'); break;
			case 'u': styles.push('text-decoration: underline'); break;
			case 's': styles.push('text-decoration: line-through'); break;
			default: break;
		}

		const classStyles: string[] = [];
		for (const { type, entity, cssText } of declarations.values()) {
			if (type === 'tag' && tag === entity) styles.push(cssText);
			if (type === 'class' && classes.includes(entity)) classStyles.push(cssText);
		}
		styles.push(...classStyles, inlineStyle);

		return styles.filter(Boolean).join(';');
	};

	const map = (source: Console): Console => {
		const styled = { ...source };
		for (const method of MESSAGE_METHODS) {
			const callback = source[method];
			if (!isFunction(callback)) continue;
			Reflect.set(styled, method, (...args: unknown[]) => {
				const index = method === 'assert' ? 1 : 0;
				const message = args[index];
				if (!isString(message) || (method === 'assert' && args[0])) {
					return Reflect.apply(callback, source, args);
				}
				const output = format(message, args.slice(index + 1), elementStyle, method);
				return Reflect.apply(callback, source, method === 'assert' ? [args[0], ...output] : output);
			});
		}
		return styled;
	};

	return {
		override() {
			const host = getHost();
			if (!host || original) return;
			original = host.console;
			host.console = map(original);
		},

		restore() {
			const host = getHost();
			if (!host || !original) return;
			host.console = original;
			original = undefined;
		},

		reset() {
			declarations.clear();
		},

		add(input: string) {
			for (const [, selector, block] of input.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
				const name = selector.trim();
				const cssText = block.trim();
				if (!name || !cssText) continue;

				const type = name.startsWith('.') ? 'class' : 'tag';
				const entity = type === 'class' ? name.slice(1) : name.toLowerCase();
				const key = `${type}:${entity}{${cssText}}`;
				// A repeated block takes its latest position in the cascade.
				declarations.delete(key);
				declarations.set(key, { type, entity, cssText });
			}
		},

		get styled(): Console {
			const host = getHost();
			return host ? map(original ?? host.console) : console;
		},
	};
};
