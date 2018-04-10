'use strict';

import OutputStream from './OutputStream';

/**
 *
 */
class Output {

  /**
   *
   * @param {Terminal} terminal
   */
  constructor ( terminal ) {

    /**
     * Holds the application
     *
     * @type {Terminal}
     */
    this.terminal = terminal;

    /**
     * Retrieves the standard output stream
     * @type {OutputStream}
     */
    this.standardOutput = new OutputStream( 'stdout' );

    /**
     * Retrieves the standard error stream
     *
     * @type {OutputStream}
     */
    this.standardError = new OutputStream( 'stderr' );
  }

  clear () {
    this.terminal.flushLines();
  }

  /**
   * Retrieves the output buffer lines
   *
   * @return {Line[]}
   */
  get buffer () {
    return this.standardOutput.data.concat( this.standardError.data );
  }
}

export default Output;
