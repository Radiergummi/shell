'use strict';

/*
 global window,
 document
 */

import JsonFilesystem from './JsonFilesystem';

class LocalStorageFilesystem extends JsonFilesystem {
  constructor ( name, keyName = name ) {
    super( name, LocalStorageFilesystem._readLocalStorageItem( keyName ) );
  }

  static _readLocalStorageItem ( path ) {
    return window.localStorage.getItem( path ) || '{}';
  }

  static _writeLocalStorageItem ( path, content ) {
    window.localStorage.setItem( path, JSON.stringify( content ) );
  }
}

export default LocalStorageFilesystem;
