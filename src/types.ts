/**
 * A registered rule for one tag or class.
 */
export type Declaration = {
	/**
	 * Type of supported CSS tokens.
	 */
	type: 'class' | 'tag';

	/**
	 * Classname without leading dot or lowercased tagName.
	 */
	entity: string;

	/**
	 * Declaration block applied to every matching element.
	 */
	cssText: string;
};

/**
 * Resolves the CSS applied to a run of text inside an element.
 */
export type ElementStyle = (tag: string, classes: string[], inheritedStyle: string, inlineStyle: string) => string;

/**
 * Formats arguments for the destination console while preserving native substitutions.
 */
export type FormatMessage = (
	message: string, args: unknown[], elementStyle: ElementStyle, method: keyof Console,
) => unknown[];

/**
 * Styles console messages using the current environment's output capabilities.
 */
export interface ConsoleCSS {
	/**
	 * Provides styled output without replacing the global console.
	 */
	readonly styled: Console;

	/**
	 * Registers CSS blocks for individual tags and classes in source order.
	 *
	 * @example
	 *  ConsoleCSS.add('.notice { color: red; }');
	 *  ConsoleCSS.styled.log('<b class="notice">Attention</b>');
	 *
	 * @param   input   CSS-like string with custom rules.
	 */
	add: (input: string) => void;

	/**
	 * Clears all custom tag and class rules.
	 */
	reset: () => void;

	/**
	 * Formats messages sent through the global console until `restore()` is called.
	 */
	override: () => void;

	/**
	 * Restores the console object captured by `override()`.
	 */
	restore: () => void;
}
