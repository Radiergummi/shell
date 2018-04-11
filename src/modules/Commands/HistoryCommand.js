'use strict';

import Command       from '../Command';
import CommandOption from '../CommandOption';

class HistoryCommand extends Command {
  configure () {
    this.setName( 'history' );
    this.setDescription( 'Show command history' );

    this.addOption( 'show-time', 's', CommandOption.types.value_none, 'Shows the time for each item' );
  }

  run ( input, output ) {
    const history  = output.terminal.history.getAll().slice( 0, -1 );
    const showTime = input.getOption( 'show-time' );

    for ( let entry of history ) {
      if ( showTime ) {
        output.standardOutput.writeLine( '' );
        output.standardOutput.writeLine( `# ${entry.date.toUTCString()}` );
      }

      output.standardOutput.writeLine( ` · ${entry.text}` );
    }
  }
}

export default HistoryCommand;
