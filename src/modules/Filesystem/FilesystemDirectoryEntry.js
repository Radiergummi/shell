'use strict';

import { EEXIST, ENOTDIR } from './errors';
import FilesystemEntry     from './FilesystemEntry';

class FilesystemDirectoryEntry extends FilesystemEntry {

  /**
   * Creates a new directory entry
   *
   * @param {string} name entry name
   */
  constructor ( name ) {

    //noinspection JSCheckFunctionSignatures
    super( '', name );
  }

  get nodeValue () {
    return undefined;
  }

  set nodeValue ( value ) {
    return undefined;
  }

  get buffer () {
    return undefined;
  }

  get content () {
    return undefined;
  }

  /**
   * Creates a new directory
   *
   * @param  {string}                            name directory name
   * @return {Promise<FilesystemDirectoryEntry>}      new directory
   */
  createDirectory ( name ) {
    if ( this.hasDirectory( name ) ) {
      return Promise.reject( `Cannot create directory ${name}: ${EEXIST}` );
    }

    //noinspection JSCheckFunctionSignatures
    return Promise.resolve( this.appendChild( new FilesystemDirectoryEntry( name ) ) );
  }

  /**
   * Checks whether a directory exists
   *
   * @param  {string}  name
   * @return {boolean}
   */
  hasDirectory ( name ) {
    return !!this.childNodes.find( entry => entry.name === name );
  }

  mount ( filesystem, mountPoint ) {
    if ( this.hasDirectory( mountPoint ) ) {
      return Promise.reject( `Cannot mount ${mountPoint} on ${this.path}: ${EEXIST}` );
    }

    filesystem.name = mountPoint;

    return Promise.resolve( this.appendChild( filesystem ) );
  }

  unmount ( mountPoint ) {
    if ( !this.hasDirectory( mountPoint ) ) {
      return Promise.reject( `Cannot unmount ${mountPoint}: ${ENOTDIR}` );
    }

    return Promise.resolve( this.removeChild( this.find( mountPoint ) ) );
  }
}

export default FilesystemDirectoryEntry;
