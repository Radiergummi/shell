'use strict';

/*
 global window,
 document
 */

class StandardInput {
  constructor ( terminal ) {
    this._terminal = terminal;
    this._value    = '';
  }

  read () {
    return this._value;
  }

  write ( newValue ) {
    this._value = newValue;
  }

  clear () {
    this._value = '';
  }

  get prompt () {
    return this._terminal.substitute( this._terminal.environment.promptString );
  }
}

export default StandardInput;
