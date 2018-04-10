'use strict';

import Line from './Line';

/**
 * Abstract output stream. Basically, output streams are just buffers for one or more lines -
 * they don't stream.
 */
class OutputStream {

  /**
   * Creates a new output stream for a certain stream name
   *
   * @param {string} streamName name of the output stream
   */
  constructor ( streamName ) {
    this._streamName = streamName;
    this._data       = [];
  }

  /**
   * Appends text to the current output line
   *
   * @param {string} text
   */
  write ( text ) {
    if ( this._data.length === 0 ) {
      this._data.push( text );
    } else {
      this._data[ this._data.length - 1 ] += text;
    }
  }

  /**
   * Appends a new line
   *
   * @param {string} text
   */
  writeLine ( text ) {
    this._data.push( text );
  }

  /**
   * Retrieves all lines in the buffer
   *
   * @return {Line[]}
   */
  get data () {
    return this._data.map( text => new Line( text, this._streamName ) );
  }
}

export default OutputStream;
