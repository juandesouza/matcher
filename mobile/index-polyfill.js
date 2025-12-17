/**
 * Entry point with FormData polyfill
 * This file replaces index.js and ensures FormData is available before any imports
 * 
 * CRITICAL: This code runs at the top level (no IIFE) to ensure it executes immediately
 */

// CRITICAL: FormData polyfill MUST run before ANY imports or requires
// Set up FormData synchronously at the top level
'use strict';

// Try to use React Native's FormData first, fallback to polyfill
if (typeof global !== 'undefined' && typeof global.FormData === 'undefined') {
  try {
    // Try to get React Native's FormData (should be available in RN 0.81+)
    const RNFormData = require('react-native/Libraries/Network/FormData').default;
    global.FormData = RNFormData;
    if (typeof globalThis !== 'undefined') {
      globalThis.FormData = RNFormData;
    }
    if (typeof window !== 'undefined') {
      window.FormData = RNFormData;
    }
  } catch (e) {
    // Fallback: Create FormData polyfill matching React Native's API
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
    
    global.FormData = FormDataPolyfill;
    if (typeof globalThis !== 'undefined') {
      globalThis.FormData = FormDataPolyfill;
    }
    if (typeof window !== 'undefined') {
      window.FormData = FormDataPolyfill;
    }
  }
}

// Now safe to import other modules
import { registerRootComponent } from 'expo';
import App from './App';

// Log startup to help debug
console.log('========== APP STARTING ==========');
console.log('Registering root component...');

try {
  registerRootComponent(App);
  console.log('Root component registered successfully');
} catch (error) {
  console.error('========== FAILED TO REGISTER ROOT COMPONENT ==========');
  console.error('Error:', error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('======================================================');
  throw error;
}
