'use strict';

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
const rnds8 = new Uint8Array( 16 ); // eslint-disable-line no-undef

const rng = function () {
  crypto.getRandomValues( rnds8 );
  return rnds8;
};

export default rng;

