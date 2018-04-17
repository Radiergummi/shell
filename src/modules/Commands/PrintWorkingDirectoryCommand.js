'use strict';

import Command     from '../Command';
import { resolve } from '../Filesystem/path';

class PrintWorkingDirectoryCommand extends Command {
  configure () {
    this.setName( 'pwd' );
    this.setDescription( 'Prints the current working directory' );
  }

  run ( input, output ) {
    const path = resolve( input.terminal.getEnv( 'pwd' ) );

    output.standardOutput.writeLine( path );
  }
}

export default PrintWorkingDirectoryCommand;
