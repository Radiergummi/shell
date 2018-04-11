'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';

class SleepCommand extends Command {
  configure () {
    this.setName( 'sleep' );
    this.setDescription( 'Suspend execution for an interval measured in seconds' );

    this.addArgument( 'seconds', CommandArgument.types.value_required, 'Time to sleep in seconds' );
  }

  run ( input, output ) {
    const timeout = input.getArgument( 'seconds' ) * 1000;

    return new Promise( resolve => setTimeout( () => resolve(), timeout ) );
  }
}

export default SleepCommand;
