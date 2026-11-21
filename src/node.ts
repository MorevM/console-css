import process from 'node:process';
import chalk from 'chalk';
import { defaultTreeAdapter, parseFragment } from 'parse5';
import { createConsoleCSS } from './console';
import { terminalStyle } from './terminal-style';
import type { DefaultTreeAdapterMap } from 'parse5';
import type { FormatMessage } from './types';

const palettes = ([0, 1, 2, 3] as const).map((level) => new chalk.Instance({ level }));

const outputPalette = (method: keyof Console) => {
	const { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS } = process.env;
	if (FORCE_COLOR !== undefined) {
		if (FORCE_COLOR === '' || FORCE_COLOR === 'true') return palettes[1];
		return palettes[Number(FORCE_COLOR)] ?? palettes[0];
	}
	const useStderr = method === 'warn' || method === 'error' || method === 'assert' || method === 'trace';
	const stream = useStderr ? process.stderr : process.stdout;
	if (!stream.isTTY || NO_COLOR || NODE_DISABLE_COLORS) return palettes[0];
	const depth = stream.getColorDepth();
	if (depth >= 24) return palettes[3];
	if (depth >= 8) return palettes[2];
	return depth >= 4 ? palettes[1] : palettes[0];
};

const formatTerminal: FormatMessage = (message, args, elementStyle, method) => {
	if (!/[&<]/.test(message)) return [message, ...args];

	const terminal = outputPalette(method);

	const render = (parent: DefaultTreeAdapterMap['parentNode'], css: string): string => {
		let output = '';
		for (const child of parent.childNodes) {
			if (defaultTreeAdapter.isTextNode(child)) {
				output += css ? terminalStyle(terminal, css)(child.value) : child.value;
				continue;
			}
			if (!defaultTreeAdapter.isElementNode(child)) continue;
			const attribute = (name: string) => child.attrs.find((attr) => attr.name === name)?.value ?? '';
			const style = terminal.level
				? elementStyle(child.tagName, attribute('class').split(/\s+/), css, attribute('style'))
				: '';
			if (child.tagName === 'img') {
				const alt = attribute('alt');
				output += style ? terminalStyle(terminal, style)(alt) : alt;
				continue;
			}
			output += render(child, style);
		}
		return output;
	};

	return [render(parseFragment(message), ''), ...args];
};

export default createConsoleCSS(formatTerminal, () => globalThis);
