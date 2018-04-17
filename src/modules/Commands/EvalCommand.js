'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';

class EvalCommand extends Command {
  configure () {
    this.setName( 'eval' );
    this.setDescription( 'Evaluates a JavaScript expression passed as a string' );

    this.addArgument( 'expression', CommandArgument.types.value_required, 'Expression to evaluate' );
  }

  run ( input, output ) {
    const expression = input.getArgument( 'expression', '"";' );
    let func;

    try {
      func = new Function( expression.startsWith( 'return' ) ? expression : `return ${expression}` );
    } catch ( error ) {
      this.throw( `Invalid expression: ${error.message}` );
    }

    const result      = func.call( window );
    const resultLines = result ? String( result ).split( '\n' ) : [];

    for ( let line of resultLines ) {
      output.standardOutput.writeLine( line );
    }
  }
}

export default EvalCommand;
