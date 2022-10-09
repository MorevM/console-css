export type CleanConsole = Omit<Console, 'Console'>;

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
	 * CSS rules related to entity like `font-weight: 700`
	 */
	rules: string[];
};
