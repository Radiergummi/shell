'use strict';

/*
 global window,
 document
 */

class StandardInput {
  constructor() {
    this._value = '';
  }

  read() {
    return this._value;
  }

  write(newValue) {
    this._value = newValue;
  }

  clear() {
    this._value = '';
  }
}

export default StandardInput
