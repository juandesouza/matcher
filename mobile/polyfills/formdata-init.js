/**
 * FormData initialization - This file must be loaded FIRST by Metro
 * It sets up FormData before any other code runs
 */

(function() {
  'use strict';
  
  // Always set up FormData (don't check - just override to ensure it exists)
  if (typeof global !== 'undefined') {
    // Create FormData polyfill
    function FormDataPolyfill() {
      this._parts = [];
    }
    
    FormDataPolyfill.prototype.append = function(key, value) {
      this._parts.push([key, value]);
    };
    
    FormDataPolyfill.prototype.getAll = function(key) {
      return this._parts
        .filter(function(part) { return part[0] === key; })
        .map(function(part) { return part[1]; });
    };
    
    FormDataPolyfill.prototype.getParts = function() {
      var self = this;
      return this._parts.map(function(part) {
        var name = part[0];
        var value = part[1];
        var contentDisposition = 'form-data; name="' + name + '"';
        var headers = {'content-disposition': contentDisposition};
        
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          if (typeof value.name === 'string') {
            headers['content-disposition'] += '; filename="' + encodeURIComponent(value.name.replace(/\//g, '_')) + '"';
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
    
    // Set FormData globally
    global.FormData = FormDataPolyfill;
    
    if (typeof globalThis !== 'undefined') {
      globalThis.FormData = FormDataPolyfill;
    }
    
    if (typeof window !== 'undefined') {
      window.FormData = FormDataPolyfill;
    }
  }
})();

