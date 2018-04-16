'use strict';

import Filesystem from '../Filesystem';

class VirtualFilesystem extends Filesystem {
  constructor ( disks = [] ) {
    super( '__ROOT__' );

    this.createDirectory( 'media' )
        .then( media => {
          for ( let disk of disks ) {
            media.mount( disk.filesystem, disk.name );

            console.log( this );
            if ( disk.flags.primary ) {
              for ( let directory of disk.filesystem.childNodes ) {
                console.log( `trying to mount ${directory.name}`, this.childNodes.map( n => n.path ) );
                this.mount( directory, directory.name );
              }
            }
          }
        } );
  }
}

export default VirtualFilesystem;
