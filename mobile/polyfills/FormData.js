/**
 * FormData polyfill for React Native
 * This must be loaded before any other modules that might use FormData
 * 
 * We use a polyfill instead of requiring React Native's FormData because
 * requiring it might cause circular dependencies or initialization issues
 */

// Create FormData polyfill matching React Native's API exactly
class FormDataPolyfill {
  constructor() {
    this._parts = [];
  }

  append(key, value) {
    this._parts.push([key, value]);
  }

  getAll(key) {
    return this._parts
      .filter(([name]) => name === key)
      .map(([, value]) => value);
  }

  getParts() {
    return this._parts.map(([name, value]) => {
      const contentDisposition = 'form-data; name="' + name + '"';
      const headers = {'content-disposition': contentDisposition};
      
      if (typeof value === 'object' && !Array.isArray(value) && value) {
        if (typeof value.name === 'string') {
          headers['content-disposition'] += `; filename="${encodeURIComponent(value.name.replace(/\//g, '_'))}"`;
        }
        if (typeof value.type === 'string') {
          headers['content-type'] = value.type;
        }
        return {...value, headers, fieldName: name};
      }
      return {string: String(value), headers, fieldName: name};
    });
  }
}

// Always use our polyfill to avoid any initialization issues
// React Native's fetch/XHR will work with this polyfill
const FormDataImplementation = FormDataPolyfill;

// Set FormData globally - this must happen before any other code runs
if (typeof global !== 'undefined') {
  global.FormData = FormDataImplementation;
}

if (typeof globalThis !== 'undefined') {
  globalThis.FormData = FormDataImplementation;
}

// Also set on window if in a web-like environment
if (typeof window !== 'undefined') {
  window.FormData = FormDataImplementation;
}

// Export for use in other files if needed
module.exports = FormDataImplementation;

