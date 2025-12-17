/**
 * Metro serializer that injects FormData polyfill at the very beginning of the bundle
 */

module.exports = (entryPoint, preModules, graph, options) => {
  const { Serializer } = require('metro/src/DeltaBundler/Serializers/serializer');
  
  // Get the default serialized bundle
  const bundle = Serializer.createBundleStartupModules(entryPoint, preModules, graph, {
    ...options,
    createModuleId: options.createModuleId,
    processModuleFilter: options.processModuleFilter,
  });
  
  // FormData polyfill code that will be injected at the very beginning
  const formDataPolyfill = `
(function() {
  'use strict';
  if (typeof global !== 'undefined') {
    function FormDataPolyfill() {
      this._parts = [];
    }
    FormDataPolyfill.prototype.append = function(key, value) {
      this._parts.push([key, value]);
    };
    FormDataPolyfill.prototype.getAll = function(key) {
      return this._parts.filter(function(part) { return part[0] === key; }).map(function(part) { return part[1]; });
    };
    FormDataPolyfill.prototype.getParts = function() {
      return this._parts.map(function(part) {
        var name = part[0];
        var value = part[1];
        var contentDisposition = 'form-data; name="' + name + '"';
        var headers = {'content-disposition': contentDisposition};
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          if (typeof value.name === 'string') {
            headers['content-disposition'] += '; filename="' + encodeURIComponent(value.name.replace(/\\//g, '_')) + '"';
          }
          if (typeof value.type === 'string') {
            headers['content-type'] = value.type;
          }
          var result = {};
          for (var k in value) {
            if (value.hasOwnProperty(k)) {
              result[k] = value[k];
            }
          }
          result.headers = headers;
          result.fieldName = name;
          return result;
        }
        return {string: String(value), headers: headers, fieldName: name};
      });
    };
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

  // Inject polyfill at the very beginning of the bundle
  bundle.pre = formDataPolyfill + '\n' + (bundle.pre || '');
  
  return bundle;
};

