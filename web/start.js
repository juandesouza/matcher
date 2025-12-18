#!/usr/bin/env node
// Startup wrapper to set up __dirname polyfill before loading the app
// This is needed because Prisma's generated client uses __dirname which doesn't exist in ES modules

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Set up __dirname polyfill before any other code runs
// Use the build directory as the base path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make __dirname available globally for Prisma's generated code
// Prisma's code may access it through different means, so we set it multiple ways
if (typeof globalThis.__dirname === 'undefined') {
	Object.defineProperty(globalThis, '__dirname', {
		value: __dirname,
		writable: false,
		enumerable: false,
		configurable: false
	});
}

if (typeof globalThis.__filename === 'undefined') {
	Object.defineProperty(globalThis, '__filename', {
		value: __filename,
		writable: false,
		enumerable: false,
		configurable: false
	});
}

// Also set on global for compatibility (some code may use global instead of globalThis)
if (typeof global.__dirname === 'undefined') {
	global.__dirname = __dirname;
}

if (typeof global.__filename === 'undefined') {
	global.__filename = __filename;
}

// For Prisma's require() calls, we also need to ensure the module system can resolve __dirname
// This is a workaround for Prisma's generated code that uses __dirname in require() calls
const require = createRequire(import.meta.url);

// Now import and run the actual app
// The polyfill should be available when Prisma's code loads
import('./build/index.js');

