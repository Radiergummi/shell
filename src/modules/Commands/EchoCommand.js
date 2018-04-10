'use strict';

/*
 global window,
 document
 */

import Command from '../Command';

class EchoCommand extends Command {

  configure () {
    this.setName( 'echo' );
    this.setDescription( 'Displays a string of text' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    output.standardOutput.writeLine( input.argv.join( ' ' ).replace( /(["'])/ig, '' ) );
  }
}

export default EchoCommand;
