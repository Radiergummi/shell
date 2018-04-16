'use strict';

import Command                  from '../Command';
import CommandArgument          from '../CommandArgument';
import FilesystemDirectoryEntry from '../Filesystem/FilesystemDirectoryEntry';

class LsCommand extends Command {
  configure () {
    this.setName( 'ls' );
    this.setDescription( 'Lists the contents of a filesystem directory' );

    this.addArgument(
      'path',
      CommandArgument.types.value_optional,
      'Directory to list. Defaults to the current working directory'
    );
  }

  run ( input, output ) {

    // either PATH arg or current working directory or just root ("/")
    const path       = input.getArgument( 'path', input.terminal.getEnv( 'pwd', '/' ) );
    const searchNode = input.terminal.storage.find( path );

    if ( !searchNode ) {
      return this.throw( `No such directory: ${path}` );
    }

    if ( !( searchNode instanceof FilesystemDirectoryEntry ) ) {
      return this.throw( `Not a directory: ${searchNode.path}` );
    }

    for ( let node of searchNode.childNodes ) {
      output.standardOutput.writeLine( node.name );
    }
  }
}

export default LsCommand;
