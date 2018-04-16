'use strict';

import OutputStream from './OutputStream';

/**
 *
 */
class Output {

  /**
   *
   * @param {Terminal} terminal
   * @param {OutputStream} stdout
   * @param {OutputStream} stderr
   */
  constructor ( terminal, stdout = new OutputStream( 'stdout' ), stderr = new OutputStream( 'stderr' ) ) {

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
    this.standardOutput = stdout;

    /**
     * Retrieves the standard error stream
     *
     * @type {OutputStream}
     */
    this.standardError = stderr;
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
