export const formatImages = (fragment: DocumentFragment) => {
	for (const image of fragment.querySelectorAll('img')) {
		const src = image.getAttribute('src');
		const width = image.getAttribute('width');
		const height = image.getAttribute('height');
		if (!src || !width || !height) {
			image.remove();
			continue;
		}

		const halfWidth = `${Number.parseFloat(width) / 2}px`;
		const halfHeight = `${Number.parseFloat(height) / 2}px`;
		const placeholder = image.ownerDocument.createElement('span');

		Object.assign(placeholder.style, {
			backgroundImage: `url(${JSON.stringify(src)})`,
			backgroundPosition: 'center center',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			fontSize: '0',
			lineHeight: '0',
			paddingLeft: halfWidth,
			paddingRight: halfWidth,
			paddingTop: halfHeight,
			paddingBottom: halfHeight,
		});
		placeholder.textContent = ' ';
		image.replaceWith(placeholder);
	}
};
