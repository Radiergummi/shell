'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';
import { resolve }     from '../Filesystem/path';

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
    const path = resolve( input.terminal.getEnv( 'pwd' ), input.getArgument( 'path' ) );

    return input.terminal.storage.exists( path )
                .then( exists => exists
                                 ? input.terminal.setEnv( 'pwd', path )
                                 : this.throw( `No such directory: ${path}` )
                );
  }
}

export default ChangeDirectoryCommand;
