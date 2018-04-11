'use strict';

const toString = {}.toString;

/**
 * Checks whether an object is an array
 *
 * @param  {Array}   arr
 * @return {boolean}
 */
export default Array.isArray || function ( arr ) {
  return toString.call( arr ) === '[object Array]';
};
