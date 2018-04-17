'use strict';

import Filesystem from '../Filesystem';

class VirtualFilesystem extends Filesystem {
  constructor ( disks = [] ) {
    super( '__ROOT__' );

    this
      .createDirectory( 'dev' )
      .then( devices => {
        for ( let disk of disks ) {
          devices.mount( disk.filesystem, disk.name );

          if ( disk.flags.primary ) {
            const entries = disk.filesystem.childNodes.filter( entry => !entry.isDotDirectory );
            for ( let directory of entries ) {
              this.mount( directory, directory.name );
            }
          }
        }
      } );
  }
}

export default VirtualFilesystem;
