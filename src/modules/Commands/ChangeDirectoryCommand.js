'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';

class ChangeDirectoryCommand extends Command {
  configure () {
    this.setName( 'cd' );
    this.setDescription( 'Changes the current working directory' );

    this.addArgument(
      'path',
      CommandArgument.types.value_optional,
      'Path to change to',
      '/'
    );
  }

  run ( input, output ) {
    const path = input.getArgument( 'path' );

    if ( !input.terminal.storage.find( path ) ) {
      return this.throw( `No such directory: ${path}` );
    }

    input.terminal.setEnv( 'pwd', path );
  }
}

export default ChangeDirectoryCommand;
