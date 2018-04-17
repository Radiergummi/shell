'use strict';

import Command            from '../Command';
import CommandArgument    from '../CommandArgument';
import CommandOption      from '../CommandOption';
import { EISDIR, ENOENT } from '../Filesystem/errors';
import { resolve }        from '../Filesystem/path';

class CatCommand extends Command {
  configure () {
    this.setName( 'cat' );
    this.setDescription( 'Concatenates and prints files' );

    this.addOption( 'number', 'n', CommandOption.types.value_none, 'Number the output lines' );

    this.addArgument( 'file', CommandArgument.types.value_required, 'File to print' );
  }

  run ( input, output ) {
    const numberLines = input.getOption( 'number', false );
    const fileName    = input.getArgument( 'file' );
    const filePath    = resolve( this.terminal.getEnv( 'pwd' ), fileName );

    if ( !input.terminal.storage.exists( filePath ) ) {
      return this.throw( `${ENOENT}: ${fileName}` );
    }

    return input.terminal.storage
                .readFile( filePath )
                .then( file => {
                  if ( file.isDirectory ) {
                    this.throw( `${EISDIR}: ${file.path}` );
                  }

                  return file;
                } )
                .then( file => {
                  const content       = file.buffer.toString().split( '\n' );
                  const longestNumber = content.length.toString().length;

                  for ( let i = 0; i < content.length; i++ ) {
                    const number = ( i + 1 ).toString().padEnd( longestNumber, ' ' );
                    output.standardOutput.writeLine( ( numberLines ? number + '\t' : '' ) + content[ i ] );
                  }
                } );
  }
}

export default CatCommand;
