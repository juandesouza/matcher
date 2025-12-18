// Polyfill for __dirname and __filename in ES modules
// This is needed for Prisma client which uses __dirname internally
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make __dirname and __filename available globally
// Prisma's generated code expects these to be available
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

// For Prisma's require() calls, we need to ensure __dirname is available
// in the module scope where Prisma code runs
// This is a workaround for Prisma's generated code that uses __dirname
Object.defineProperty(globalThis, '__dirname', {
	value: __dirname,
	writable: false,
	enumerable: false,
	configurable: false
});

Object.defineProperty(globalThis, '__filename', {
	value: __filename,
	writable: false,
	enumerable: false,
	configurable: false
});

export { __dirname, __filename };


