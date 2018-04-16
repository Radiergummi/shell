'use strict';

import FilesystemEntry from './FilesystemEntry';
import { basename }    from './path';

class Disk {

  /**
   * Holds available disk flags
   *
   * @returns {{primary: boolean, readOnly: boolean}}
   */
  static get flags () {
    return {
      primary:  false,
      readOnly: false
    };
  }

  /**
   * Creates a new disk
   *
   * @param {string}                                  name       name of the disk
   * @param {Filesystem}                              filesystem filesystem to use
   * @param {{primary?: boolean, readOnly?: boolean}} [flags]    disk flags
   */
  constructor ( name, filesystem, flags = {} ) {
    this.name       = name;
    this.filesystem = filesystem;

    //noinspection JSUnresolvedVariable
    /**
     * Holds all disk flags
     *
     * @type {{primary: boolean, readOnly: boolean}}
     */
    this.flags = Object.assign( {}, this.constructor.flags, flags );

    filesystem.initialize( this );
  }

  /**
   * Reads a file from the disk
   *
   * @param  {string}                   path
   * @return {Promise<FilesystemEntry>}
   */
  async read ( path ) {
    return await this.filesystem.readFile( path );
  }

  /**
   * Writes a file to the disk
   *
   * @param  {Buffer|string|number|Array} buffer
   * @param  {string}                     path
   * @param  {Object}                     options
   * @return {Promise<FilesystemEntry>}
   */
  async write ( buffer, path, options = {} ) {
    return await this.filesystem.writeFile( path, Buffer.from( buffer ), options );
  }

  /**
   * Checks whether a file exists
   *
   * @param  {string}           path
   * @return {Promise<boolean>}
   */
  async exists ( path ) {
    return await this.filesystem.exists( path );
  }

  /**
   * Puts a file to the specified directory
   *
   * @param  {FilesystemEntry} file file to write
   * @param  {string}          path file target path
   *
   * @return {Promise<FilesystemEntry>}
   */
  async putFile ( file, path ) {
    if ( !file instanceof FilesystemEntry ) {
      throw new TypeError( `Invalid type "${typeof file}": putFile only accepts objects of type FilesystemEntry` );
    }

    return await this.write( file.buffer, path, {} );
  }

  /**
   * Puts a file to the disk
   *
   * @param  {Buffer|string|number|Array} content file content
   * @param  {string}                     path    file target path
   * @return {Promise<FilesystemEntry>}
   */
  async put ( content, path ) {
    return await this.putFile( new FilesystemEntry( content, basename( path ) ), path );
  }

  /**
   * Alias for read
   *
   * @param args...
   *
   * @return {Promise<FilesystemEntry>}
   */
  get ( ...args ) {
    return this.read( ...args );
  }

  /**
   * Alias for exists
   *
   * @param args...
   *
   * @return {Promise<boolean>}
   */
  has ( ...args ) {
    return this.exists( ...args );
  }
}

export default Disk;
