'use strict';

import FilesystemEntry from './FilesystemEntry';

class Disk {

  /**
   * Creates a new disk
   *
   * @param {string}     name       name of the disk
   * @param {Filesystem} filesystem filesystem to use
   */
  constructor ( name, filesystem ) {
    this.name        = name;
    this._filesystem = filesystem;
  }

  /**
   * Reads a file from the disk
   *
   * @param  {string}                   path
   * @return {Promise<FilesystemEntry>}
   */
  async read ( path ) {
    return await this._filesystem.read( path );
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
    return await this._filesystem.write( path, Buffer.from( buffer ), options );
  }

  /**
   * Checks whether a file exists
   *
   * @param  {string}           path
   * @return {Promise<boolean>}
   */
  async exists ( path ) {
    return await this._filesystem.exists( path );
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

    return await this.write( file.buffer, path, {} )
                     .then( file => {
                       file.path = path;

                       return file;
                     } );
  }

  /**
   * Puts a file to the disk
   *
   * @param  {Buffer|string|number|Array} content file content
   * @param  {string}                     path    file target path
   * @return {Promise<FilesystemEntry>}
   */
  async put ( content, path ) {
    return await this.putFile( new FilesystemEntry( content ), path );
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
