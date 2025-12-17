/**
 * Babel plugin to inject FormData polyfill at the very beginning of the bundle
 * This ensures FormData is available before any other code runs
 */

module.exports = function injectFormData() {
  return {
    visitor: {
      Program: {
        enter(path) {
          // Only inject at the entry point (index.js)
          const filename = this.file.opts.filename || '';
          if (!filename.includes('index.js') && !filename.includes('index.ts')) {
            return;
          }

          // Inject FormData polyfill at the very top
          const formDataCode = `
// FormData polyfill - injected by Babel plugin
(function() {
  if (typeof global.FormData === 'undefined') {
    class FormDataPolyfill {
      constructor() {
        this._parts = [];
      }
      append(key, value) {
        this._parts.push([key, value]);
      }
      getAll(key) {
        return this._parts.filter(([name]) => name === key).map(([, value]) => value);
      }
      getParts() {
        return this._parts.map(([name, value]) => {
          const contentDisposition = 'form-data; name="' + name + '"';
          const headers = {'content-disposition': contentDisposition};
          if (typeof value === 'object' && !Array.isArray(value) && value) {
            if (typeof value.name === 'string') {
              headers['content-disposition'] += '; filename="' + encodeURIComponent(value.name.replace(/\\//g, '_')) + '"';
            }
            if (typeof value.type === 'string') {
              headers['content-type'] = value.type;
            }
            return Object.assign({}, value, {headers: headers, fieldName: name});
          }
          return {string: String(value), headers: headers, fieldName: name};
        });
      }
    }
    global.FormData = FormDataPolyfill;
    if (typeof globalThis !== 'undefined') {
      globalThis.FormData = FormDataPolyfill;
    }
    if (typeof window !== 'undefined') {
      window.FormData = FormDataPolyfill;
    }
  }
})();
`;

          // Insert at the very beginning of the program
          path.unshiftContainer('body', this.parse(formDataCode));
        },
      },
    },
  };
};

