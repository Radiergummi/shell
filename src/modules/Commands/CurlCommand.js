'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';

const defaultProxy= 'https://cors-anywhere.herokuapp.com/';

class CurlCommand extends Command {
  configure () {
    this.setName( 'curl' );
    this.setDescription( 'Fetches content from an HTTP resource' );

    this.addArgument( 'url', CommandArgument.types.value_required, 'URL to fetch' );
  }

  run ( input, output ) {
    const proxy = output.terminal.getEnv( 'proxy_url', defaultProxy );

    return fetch( proxy + input.getArgument( 'url' ) )
      .then( response => response.text() )
      .then( text => {
        const lines = text.split( '\n' );

        for ( let line of lines ) {
          output.standardOutput.writeLine( line );
        }
      } );
  }
}

export default CurlCommand;
