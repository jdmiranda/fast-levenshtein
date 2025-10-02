(function() {
  'use strict';

  var collator;
  try {
    collator = (typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined") ? Intl.Collator("generic", { sensitivity: "base" }) : null;
  } catch (err){
    console.log("Collator could not be initialized and wouldn't be used");
  }

  var levenshtein = require('fastest-levenshtein');

  // arrays to re-use
  var prevRow = [],
    str2Char = [],
    str1Char = [];

  // Result cache for repeated comparisons
  var cache = {};
  var cacheSize = 0;
  var MAX_CACHE_SIZE = 10000;

  /**
   * Based on the algorithm at http://en.wikipedia.org/wiki/Levenshtein_distance.
   */
  var Levenshtein = {
    /**
     * Calculate levenshtein distance of the two strings.
     *
     * @param str1 String the first string.
     * @param str2 String the second string.
     * @param [options] Additional options.
     * @param [options.useCollator] Use `Intl.Collator` for locale-sensitive string comparison.
     * @return Integer the levenshtein distance (0 and above).
     */
    get: function(str1, str2, options) {
      // Early exit for identical strings
      if (str1 === str2) return 0;

      var useCollator = (options && collator && options.useCollator);

      if (useCollator) {
        // Check cache first
        var cacheKey = str1 + '\x00' + str2 + '\x01';
        if (cache[cacheKey] !== undefined) {
          return cache[cacheKey];
        }

        var str1Len = str1.length,
          str2Len = str2.length;

        // base cases
        if (str1Len === 0) return str2Len;
        if (str2Len === 0) return str1Len;

        // two rows
        var curCol, nextCol, i, j, tmp;

        // Pre-cache character codes for both strings
        for (i = 0; i < str1Len; ++i) {
          str1Char[i] = str1.charCodeAt(i);
        }

        // initialise previous row and cache str2 character codes
        for (i = 0; i < str2Len; ++i) {
          prevRow[i] = i;
          str2Char[i] = str2.charCodeAt(i);
        }
        prevRow[str2Len] = str2Len;

        var strCmp;
        var str1CharI;

        // calculate current row distance from previous row using collator
        for (i = 0; i < str1Len; ++i) {
          nextCol = i + 1;
          str1CharI = str1Char[i];

          for (j = 0; j < str2Len; ++j) {
            curCol = nextCol;

            // substitution - optimized character comparison
            strCmp = str1CharI === str2Char[j] ? 0 : (0 === collator.compare(String.fromCharCode(str1CharI), String.fromCharCode(str2Char[j])) ? 0 : 1);

            nextCol = prevRow[j] + strCmp;

            // insertion
            tmp = curCol + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }
            // deletion
            tmp = prevRow[j + 1] + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }

            // copy current col value into previous (in preparation for next iteration)
            prevRow[j] = curCol;
          }

          // copy last col value into previous (in preparation for next iteration)
          prevRow[j] = nextCol;
        }

        // Cache result
        if (cacheSize < MAX_CACHE_SIZE) {
          cache[cacheKey] = nextCol;
          cacheSize++;
        }

        return nextCol;
      }
      return levenshtein.distance(str1, str2);
    }

  };

  // amd
  if (typeof define !== "undefined" && define !== null && define.amd) {
    define(function() {
      return Levenshtein;
    });
  }
  // commonjs
  else if (typeof module !== "undefined" && module !== null && typeof exports !== "undefined" && module.exports === exports) {
    module.exports = Levenshtein;
  }
  // web worker
  else if (typeof self !== "undefined" && typeof self.postMessage === 'function' && typeof self.importScripts === 'function') {
    self.Levenshtein = Levenshtein;
  }
  // browser main thread
  else if (typeof window !== "undefined" && window !== null) {
    window.Levenshtein = Levenshtein;
  }
}());
