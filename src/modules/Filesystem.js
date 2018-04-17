'use strict';
import { ENOENT }                     from './Filesystem/errors';
import FilesystemDirectoryEntry       from './Filesystem/FilesystemDirectoryEntry';
import FilesystemEntry                from './Filesystem/FilesystemEntry';
import { basename, dirname, resolve } from './Filesystem/path';

class Filesystem extends FilesystemDirectoryEntry {
  static get flags () {
    return {
      append: 'APPEND',
      lock:   'LOCK'
    };
  }

  constructor ( name ) {
    super( name );
  }

  /**
   * Initializes the file system. If implemented, this should load any predefined files and directories
   * and create the required filesystem nodes. If necessary, implementors can overwrite any further
   * methods or properties found in the Node, FilesystemEntry or FilesystemDirectoryEntry to
   * customize interaction with disks. This enables usage of any kind of actual or remote
   * filesystems inside the application.
   *
   * @param {Disk} disk disk this filesystem gets mounted on
   */
  initialize ( disk ) {
    // this must mount the provided file system using any custom mount logic
  }

  /**
   * Releases the file system. If implemented, this should persist any changes to te filesystem.
   * Implementors can decide whether they want to overwrite any other properties and methods for
   * instant persistence or use this handler to persist once the application is being shut down.
   *
   * @param {Object} options
   */
  release ( options ) {
    // this must unmount the provided file system using any custom persistence logic
  }

  /**
   * Reads a file from the file system
   *
   * @param  {string}                   path
   * @return {Promise<FilesystemEntry>}
   */
  readFile ( path ) {
    return new Promise( ( resolve, reject ) => {
      const entry = this._resolvePath( path );

      if ( !entry ) {
        return reject( `${ENOENT}: ${path}` );
      }

      return resolve( entry );
    } );
  }

  /**
   * Writes a file to the file system
   *
   * @param  {Buffer}  content
   * @param  {string}  path
   * @param  {Object}  options
   * @param  {boolean} options.append
   * @return {Promise<FilesystemEntry>}
   */
  writeFile ( path, content, options = {} ) {
    return new Promise( ( resolve, reject ) => {
      const directory = this._resolvePath( dirname( path ) );

      if ( directory instanceof FilesystemDirectoryEntry ) {
        let file;

        if ( this.exists( path ) && ( file = this._resolvePath( path ) ) ) {

          if ( options.append ) {
            file.buffer += content;
          } else {
            file.buffer = content;
          }
        } else {
          file = directory.appendChild( new FilesystemEntry( content, basename( path ) ) );
        }

        file.fileystem = this;

        return resolve( file );
      }

      return reject( `${ENOENT}: ${directory}` );
    } );
  }

  /**
   * Checks whether a file exists
   *
   * @param  {string}           path
   * @return {Promise<boolean>}
   */
  exists ( path ) {
    return Promise.resolve( !!this._resolvePath( path ) );
  }

  _resolvePath ( path ) {

    //noinspection JSCheckFunctionSignatures
    return this.find( resolve( this.path, path ) );
  }
}

export default Filesystem;
