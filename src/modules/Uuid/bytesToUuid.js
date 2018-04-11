'use strict';

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for ( let i = 0; i < 256; ++i ) {
  byteToHex[ i ] = ( i + 0x100 ).toString( 16 ).substr( 1 );
}

/**
 * Converts bytes to UUIDs
 *
 * @param buf
 * @param offset
 * @return {string}
 */
export default function bytesToUuid ( buf, offset ) {
  let i   = offset || 0;
  let bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ( [
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ],
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ], '-',
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ], '-',
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ], '-',
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ], '-',
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ],
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ],
    bth[ buf[ i++ ] ], bth[ buf[ i++ ] ]
  ] ).join( '' );
}
