import type { PlainObject } from '@morev/helpers';
import { unquote } from '@morev/helpers';

/* eslint-disable @typescript-eslint/indent */
const parseImageAttributes = (attrs: string) => attrs
	.replace(/\s+/g, ' ').trim()
	.split(' ').map(i => i.trim())
	.reduce<PlainObject<string>>((acc, part) => {
		const [key, value] = part.split('=');
		if (key === '') return acc;
		acc[key] = unquote(value) || '';
		return acc;
}, {});
/* eslint-enable @typescript-eslint/indent */

export const replaceBetween = (origin: string, start: number, end: number, replacement: string = '') => {
	if (start < 0) start = 0;
	return origin.slice(0, start) + replacement + origin.slice(end);
};

export const getChildNodes = (html: string) => {
	const div = document.createElement('div');
	div.innerHTML = html;
	return [...div.childNodes] as Element[];
};

export const generateImageFromAttrs = (attrs: PlainObject<string>) => {
	if (!attrs.src || !attrs.width || !attrs.height) return '';

	const halfW = `${parseFloat(attrs.width) / 2}px`;
	const halfH = `${parseFloat(attrs.height) / 2}px`;

	const a = [
		`background-image: url(${attrs.src})`,
		`background-position: center center`,
		`background-size: cover`,
		`background-repeat: no-repeat`,
		`font-size: 0`,
		`line-height: 0`,
		`padding-left: ${halfW}`,
		`padding-right: ${halfW}`,
		`padding-top: ${halfH}`,
		`padding-bottom: ${halfH}`,
	];

	return `<span style="${a.join('; ')}"> </span>`;
};

export const formatImages = (html: string) => {
	const matches = [...html.matchAll(/<img([^>]*)\/?>/g)];
	if (!matches.length) return html;

	let difference = 0;
	matches.forEach(match => {
		const attrs = parseImageAttributes(match[1]);
		const pseudoImage = generateImageFromAttrs(attrs);
		html = replaceBetween(html, match.index! - difference, match[0].length - difference, pseudoImage);
		difference += match[0].length - pseudoImage.length;
	});

	return html;
};
