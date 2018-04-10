'use strict';

import Command from '../Command';
import Input   from '../Input';

class DateCommand extends Command {

  configure () {
    this.setName( 'date' );
    this.setDescription( 'Displays date and time' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    output.standardOutput.writeLine( new Date().toUTCString() );
  }
}

export default DateCommand;
