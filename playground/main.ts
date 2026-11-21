import ConsoleCSS from '../src/index';
import { comparisonPath, printComparison } from './comparison.js';

ConsoleCSS.add('.notice { color: rebeccapurple; }');
ConsoleCSS.styled.log('<b class="notice">Hello</b> from ConsoleCSS');

const button = document.querySelector<HTMLButtonElement>('#print-comparison');
const status = document.querySelector<HTMLOutputElement>('#comparison-status');
if (button && status) {
	button.addEventListener('click', async () => {
		button.disabled = true;
		status.value = 'Printing…';
		try {
			printComparison();
			const response = await fetch(comparisonPath, { method: 'POST' });
			if (response.status !== 204) throw new Error('Terminal unavailable');
			status.value = 'Printed to DevTools and the terminal.';
		} catch {
			status.value = 'Terminal unavailable. Start the playground with pnpm dev and try again.';
		} finally {
			button.disabled = false;
		}
	});
}
