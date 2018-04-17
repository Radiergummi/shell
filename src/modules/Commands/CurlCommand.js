'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';
import CommandOption   from '../CommandOption';

/**
 * We'll need a CORS proxy here. This one is provided as a default, but easily overridable
 * by simply setting the $proxy_url environment variable inside the shell.
 *
 * @type {string}
 */
const defaultProxy = 'https://cors-anywhere.herokuapp.com/';

class CurlCommand extends Command {
  configure () {
    this.setName( 'curl' );
    this.setDescription( 'Fetches content from an HTTP resource' );

    this.addArgument( 'url', CommandArgument.types.value_required, 'URL to fetch' );

    this.addOption( 'Header', 'H', CommandOption.types.value_optional, 'Pass custom header line to server', 'header' );
    this.addOption( 'method', 'X', CommandOption.types.value_optional, 'Specify request method to use', 'method' );
    this.addOption( 'data', 'd', CommandOption.types.value_optional, 'HTTP POST data' );
    this.addOption( 'basic', null, CommandOption.types.value_optional, 'Use basic authentication' );
  }

  run ( input, output ) {
    const proxy = output.terminal.getEnv( 'proxy_url', defaultProxy );
    console.log( input );
    const method = input.getOption( 'method', 'GET' ).toUpperCase();
    const body   = [ 'GET', 'HEAD' ].includes( method ) === false ? input.getOption( 'data' ) : undefined;

    const request = new Request(
      proxy + input.getArgument( 'url' ),
      {
        method,
        body,
        headers: new Headers( input.getOption( 'Header', {} ) )
      }
    );

    return fetch( request )
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
