'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';

class AliasCommand extends Command {

  configure () {
    this.setName( 'alias' );
    this.setDescription( 'Creates an alias for another command' );

    this.addArgument( 'alias', CommandArgument.types.value_required, 'Alias to set in the format alias="command"' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    const [ alias, command ] = input.getArgument( 'alias' ).split( '=' );

    if ( !alias || !command ) {
      this.throw( 'wrong syntax, use alias="command"' );
    }

    input.handler.alias( alias, command );
  }
}

export default AliasCommand;
