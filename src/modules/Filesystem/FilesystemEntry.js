'use strict';

import Node        from './Node';
import { resolve } from './path';

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

  /**
   *
   * @returns {Buffer}
   */
  get buffer () {

    //noinspection JSValidateTypes
    return this.nodeValue;
  }

  /**
   *
   * @param {Buffer} value
   */
  set buffer ( value ) {

    //noinspection JSValidateTypes
    this.nodeValue = value;
  }

  get content () {
    return this.buffer.toString();
  }

  set content ( value ) {
    this.nodeValue = Buffer.from( value );
  }

  /**
   * Whether the entry is a directory. Proxy for the inherited static getter
   *
   * @returns {boolean}
   */
  get isDirectory () {
    return this.constructor.isDirectory;
  }

  static get isDirectory () {
    return false;
  }

  get isDotDirectory () {
    return this.constructor.isDotDirectory;
  }

  static get isDotDirectory () {
    return false;
  }
}

export default FilesystemEntry;
