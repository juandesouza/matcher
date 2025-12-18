// Polyfill for __dirname and __filename in ES modules
// This is needed for Prisma client which uses __dirname internally
// Note: This is a backup polyfill. The main polyfill is in start.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make __dirname and __filename available globally
// Only set if not already defined (start.js should have set it first)
if (typeof globalThis.__dirname === 'undefined') {
	globalThis.__dirname = __dirname;
}

if (typeof globalThis.__filename === 'undefined') {
	globalThis.__filename = __filename;
}

// Also set on global object (for compatibility)
if (typeof global.__dirname === 'undefined') {
	global.__dirname = __dirname;
}

if (typeof global.__filename === 'undefined') {
	global.__filename = __filename;
}

export { __dirname, __filename };


