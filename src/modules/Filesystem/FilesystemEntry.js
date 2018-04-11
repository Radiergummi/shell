'use strict';

import Node from './Node';

class FilesystemEntry extends Node {

  /**
   *
   * @param {Buffer|string|number} content
   */
  constructor ( content ) {
    super( Buffer.from( content ) );
  }

  get buffer () {
    return this.nodeValue;
  }
}

export default FilesystemEntry;
