'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';
import Input           from '../Input';

class SetCommand extends Command {

  configure () {
    this.setName( 'set' );
    this.setDescription( 'Sets a new environment variable' );

    this.addArgument( 'variable', CommandArgument.types.value_required, 'Variable to set as "VARIABLE=VALUE"' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    const [ variable, value ] = input.getArgument( 'variable' ).split( '=' );

    if ( !variable || !value ) {
      throw new Error( `Syntax error: Could not determine variable or value. Use "VARIABLE=VALUE"` );
    }

    output.terminal.environment[ variable ] = value;

    output.standardOutput.writeLine( input.getArgument( 'variable' ) );
  }
}

export default SetCommand;
