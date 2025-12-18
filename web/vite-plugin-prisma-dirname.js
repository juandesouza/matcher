// Vite plugin to inject __dirname polyfill for Prisma
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export function prismaDirnamePolyfill() {
	return {
		name: 'prisma-dirname-polyfill',
		generateBundle(options, bundle) {
			// Inject polyfill at the top of server chunks that might use Prisma
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (chunk.type === 'chunk' && chunk.isEntry && chunk.code.includes('@prisma/client')) {
					const polyfill = `
// __dirname polyfill for ES modules (Prisma compatibility)
import { fileURLToPath } from 'url';
import { dirname } from 'path';
if (typeof globalThis.__dirname === 'undefined') {
	const __filename = fileURLToPath(import.meta.url);
	globalThis.__dirname = dirname(__filename);
	Object.defineProperty(globalThis, '__dirname', {
		value: globalThis.__dirname,
		writable: false,
		enumerable: false,
		configurable: false
	});
}
`;
					chunk.code = polyfill + chunk.code;
				}
			}
		}
	};
}

