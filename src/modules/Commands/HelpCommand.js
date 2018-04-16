'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';

class HelpCommand extends Command {
  configure () {
    this.setName( 'help' );
    this.setDescription( 'Shows help for the shell' );

    this.addArgument(
      'command',
      CommandArgument.types.value_optional,
      'Command to show help for',
      'command'
    );
  }

  run ( input, output ) {
    if ( input.hasArgument( 'command' ) ) {
      const helpInput = input.create();
      helpInput.addOption( 'help', true );

      return input.handler.run( input.getArgument( 'command' ), helpInput, output );
    }

    output.standardOutput.writeLine( 'Shell help document' );
    output.standardOutput.writeLine( '' );
    output.standardOutput.writeLine(
      'Welcome to the shell help. The following list shows all available built-in commands.' );
    output.standardOutput.writeLine( 'To view help for a specific command, type `help COMMAND`.' );
    output.standardOutput.writeLine( '' );

    const listInput = input.create();
    listInput.addOption( 'verbose', true );

    return input.handler.run( 'list', listInput, output );
  }
}

export default HelpCommand;
