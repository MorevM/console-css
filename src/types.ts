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
