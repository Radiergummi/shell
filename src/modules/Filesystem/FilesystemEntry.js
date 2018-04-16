'use strict';

import Node from './Node';

class FilesystemEntry extends Node {

  /**
   *
   * @param {Buffer|string|number} content entry content
   * @param {string}               name    entry name
   */
  constructor ( content, name ) {

    //noinspection JSCheckFunctionSignatures
    super( Buffer.from( content ), name );
  }

  get buffer () {
    return this.nodeValue;
  }

  get content () {
    return this.buffer;
  }
}

export default FilesystemEntry;
