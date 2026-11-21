import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import parseStyle from 'inline-style-parser';
import type chalk from 'chalk';
import type { RgbColor } from 'colord';

extend([namesPlugin]);

export const terminalStyle = (base: chalk.Chalk, css: string): chalk.Chalk => {
	let foreground: RgbColor | undefined;
	let background: RgbColor | undefined;
	let isBold = false;
	let isItalic = false;
	let hasUnderline = false;
	let hasStrikethrough = false;
	const declarations = parseStyle(css, { silent: true }).filter((item) => item.type === 'declaration');
	const important = /!\s*important\s*$/i;
	declarations.sort((a, b) => Number(important.test(a.value)) - Number(important.test(b.value)));

	declarations.forEach((declaration) => {
		const value = declaration.value.replace(important, '').trim().toLowerCase();
		const property = declaration.property.toLowerCase();
		switch (property) {
			case 'color':
			case 'background':
			case 'background-color': {
				const color = colord(value);
				if (!color.isValid()) break;
				const rgb = color.alpha() === 1 ? color.toRgb() : undefined;
				if (property === 'color') foreground = rgb;
				else background = rgb;
				break;
			}
			case 'font-weight':
				if (value === 'bold' || value === 'bolder') isBold = true;
				else if (value === 'normal' || value === 'lighter') isBold = false;
				else if (/^\d+$/.test(value)) isBold = Number(value) >= 600;
				break;
			case 'font-style':
				if (value === 'normal' || value === 'italic' || value === 'oblique') isItalic = value !== 'normal';
				break;
			case 'text-decoration':
			case 'text-decoration-line': {
				const lines = value.split(/\s+/);
				hasUnderline = lines.includes('underline');
				hasStrikethrough = lines.includes('line-through');
				break;
			}
			default: break;
		}
	});

	let style = base;
	if (foreground) style = style.rgb(foreground.r, foreground.g, foreground.b);
	if (background) style = style.bgRgb(background.r, background.g, background.b);
	if (isBold) style = style.bold;
	if (isItalic) style = style.italic;
	if (hasUnderline) style = style.underline;
	if (hasStrikethrough) style = style.strikethrough;
	return style;
};
