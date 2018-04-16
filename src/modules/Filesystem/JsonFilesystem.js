'use strict';

/*
 global window,
 document
 */

import Filesystem from '../Filesystem';
import { join }   from './path';

class JsonFilesystem extends Filesystem {

  /**
   *
   * @param  {string}  name
   * @param  {string}  data
   * @return {Promise}
   */
  constructor ( name, data ) {
    super( name );

    //noinspection JSIgnoredPromiseFromCall
    this._iterateJsonTree( this, JSON.parse( data ) );
  }

  /**
   * Recursively iterates the provided JSON tree
   *
   * @param rootNode
   * @param tree
   * @returns {Promise<[*]>}
   * @private
   */
  async _iterateJsonTree ( rootNode, tree = {} ) {
    const operations = [];

    for ( let [ name, content ] of Object.entries( tree ) ) {
      if ( typeof content === 'string' ) {
        const file = await this.writeFile( join( rootNode.path, name ), content );

        operations.push( file );
      } else {
        const directory = await rootNode.createDirectory( name );

        operations.push( this._iterateJsonTree( directory, content ) );
      }
    }

    return Promise.all( operations );
  }
}

export default JsonFilesystem;
