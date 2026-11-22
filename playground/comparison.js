import ConsoleCSS from '@morev/console-css';

export const comparisonPath = '/__console-css/comparison';

export const printComparison = () => {
	ConsoleCSS.add(`
		.demo-success { color: #087672; }
		.demo-label { color: white; background: #6838a0; padding: 4px 12px; border-radius: 8px; font-size: 18px; }
	`);
	const { log } = ConsoleCSS.styled;
	log('<b class="demo-success">Build ready</b> · <u>%d checks passed</u>', 3);
	log('<span class="demo-label">Release notes</span>');
	const swatch = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPgKCsCAAF6APE6kLHpAAAAAElFTkSuQmCC';
	log(`Palette: <img src="${swatch}" width="18" height="18" alt="[teal swatch]">`);
};
