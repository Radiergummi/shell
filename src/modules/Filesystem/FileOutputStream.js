'use strict';

import Line            from '../Line';
import OutputStream    from '../OutputStream';
import { ENOFILE }     from './errors';
import FilesystemEntry from './FilesystemEntry';

class FileOutputStream extends OutputStream {

  /**
   *
   * @param {FilesystemEntry} file
   */
  constructor ( file ) {
    if ( !( file instanceof FilesystemEntry ) ) {
      throw new Error( `${ENOFILE}: ${file.toString()}` );
    }

    super( file.path );

    this._file = file;
  }

  /**
   * Appends text to the current output line
   *
   * @param {string} text
   */
  write ( text ) {
    this._file.content += text;
  }

  /**
   * Appends a new line
   *
   * @param {string} text
   */
  writeLine ( text ) {
    this._file.content += `\n${text}`;
  }

  /**
   * Retrieves all lines in the buffer
   *
   * @return {Line[]}
   */
  get data () {
    return this._file.content.split( '\n' ).map( text => new Line( text, this._streamName ) );
  }
}

export default FileOutputStream;
