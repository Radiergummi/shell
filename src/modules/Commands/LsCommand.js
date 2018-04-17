'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';
import CommandOption   from '../CommandOption';
import { ENOENT }      from '../Filesystem/errors';

class LsCommand extends Command {
  configure () {
    this.setName( 'ls' );
    this.setDescription( 'Lists the contents of a filesystem directory' );

    this.addArgument(
      'path',
      CommandArgument.types.value_optional,
      'Directory to list. Defaults to the current working directory'
    );

    this.addOption(
      'All',
      'A',
      CommandOption.types.value_none,
      'List all entries except for . and .. .'
    );

    this.addOption(
      'all-but',
      'a',
      CommandOption.types.value_none,
      'Include directory entries whose names begin with a dot'
    );
  }

  run ( input, output ) {

    // either PATH arg or current working directory or just root ("/")
    const path       = input.getArgument( 'path', input.terminal.getEnv( 'pwd', '/' ) );
    const searchNode = input.terminal.storage.find( path );

    if ( !searchNode ) {
      return this.throw( `${ENOENT}: ${path}` );
    }

    if ( !( searchNode.isDirectory ) ) {
      output.standardOutput.writeLine( `${searchNode.name}\t${searchNode.buffer.length}` );

      return;
    }

    for ( let node of searchNode.childrenEntries ) {
      if ( node.isDotDirectory ) {
        if ( input.getOption( 'all-but', false ) ) {
          output.standardOutput.writeLine( node.name );
        }
      } else {
        output.standardOutput.writeLine( node.name );
      }
    }
  }
}

export default LsCommand;
