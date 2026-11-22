import { isElement, isServer } from '@morev/utils';
import { createConsoleCSS } from './console';
import { formatImages } from './utils';
import type { FormatMessage } from './types';

const formatBrowser: FormatMessage = (message, rest, elementStyle) => {
	const template = document.createElement('template');
	template.innerHTML = message;
	formatImages(template.content);

	const substitutions: unknown[] = [];
	const render = (parent: ParentNode, style: string): string => {
		let format = '';
		for (const child of parent.childNodes) {
			if (isElement(child)) {
				const inlineStyle = child instanceof HTMLElement ? child.style.cssText : '';
				const css = elementStyle(child.localName, [...child.classList], style, inlineStyle);
				format += render(child, css);
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
};

export default createConsoleCSS(formatBrowser, () => isServer() ? undefined : window);
