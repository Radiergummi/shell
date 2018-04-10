'use strict';

/*
 global window,
 document
 */

import Command       from '../Command';
import CommandOption from '../CommandOption';

class ListCommand extends Command {

  configure () {
    this.setName( 'list' );
    this.setDescription( 'lists all available commands' );

    this.addOption( 'verbose', 'v', CommandOption.types.value_none, 'Shows detailed command descriptions' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    const commands = Object.values( input.handler.commands );

    const maximumNameLength = commands.reduce( ( max, command ) => {
      const nameLength = command.getName().length;

      return max > nameLength ? max : nameLength;
    }, 0 );

    output.standardOutput.writeLine( 'Available commands:' );

    for ( let command of commands ) {
      if ( input.getOption( 'verbose' ) ) {
        output.standardOutput.writeLine(
          `  ${command.getName().padEnd( maximumNameLength )} ${command.getDescription() || ''}`
        );
      } else {
        output.standardOutput.writeLine( `  ${command.getName()}` );
      }
    }

    output.standardOutput.writeLine( '' );
  }
}

export default ListCommand;
