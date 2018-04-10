'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';
import Input           from '../Input';

class EnvCommand extends Command {

  configure () {
    this.setName( 'env' );
    this.setDescription( 'Shows and modifies environment variables' );

    this.addArgument( 'name', CommandArgument.types.value_optional, 'Name of the variable to show' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    if ( input.hasArgument( 'name' ) ) {
      console.log(input);
      const variable = input.getArgument( 'name' );

      return output.standardOutput.writeLine( `${variable}=${output.terminal.environment[ variable ]}` );
    }

    for ( let variable in output.terminal.environment ) {
      output.standardOutput.writeLine( `${variable}=${output.terminal.environment[ variable ]}` );
    }
  }
}

export default EnvCommand;
