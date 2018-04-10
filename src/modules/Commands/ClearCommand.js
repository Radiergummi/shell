'use strict';

import Command from '../Command';

class ClearCommand extends Command {

  getName () {
    return 'clear';
  }

  getDescription() {
    return 'Clears the terminal screen';
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    output.clear();
  }
}

export default ClearCommand;
