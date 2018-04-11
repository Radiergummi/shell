'use strict';
import Node from './Filesystem/Node';

class Filesystem extends Node {
  static get flags () {
    return {
      append: 1,
      lock:   2
    };
  }

  constructor ( name, options ) {
    super();
    this.name = name;
  }

  mount ( options ) {
  }

  /**
   * Reads a file from the file system
   *
   * @param  {string}                   path
   * @return {Promise<FilesystemEntry>}
   */
  readFile ( path ) {
    return new Promise( ( resolve, reject ) => {
      return this._resolvePath( path );
    } );
  }

  createDirectory ( path ) {
    return new Promise( ( resolve, reject ) => {

    } );
  }

  /**
   * Writes a file to the file system
   *
   * @param  {Buffer} content
   * @param  {string} path
   * @param  {Object} options
   * @return {Promise<FilesystemEntry>}
   */
  writeFile ( path, content, options = {} ) {
    return new Promise( ( resolve, reject ) => {
    } );
  }

  /**
   * Checks whether a file exists
   *
   * @param  {string}           path
   * @return {Promise<boolean>}
   */
  exists ( path ) {
    return new Promise( ( resolve, reject ) => {
    } );
  }

  _resolvePath ( path ) {
    const node = this.find( path.split( '/' ).slice( 0, -1 ).join( '/' ) );
  }
}

export default Filesystem;
