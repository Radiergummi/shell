'use strict';

class CommandHistory {
  constructor() {
    this._lines = [];
    this._currentLine = 0;
  }

  push(line) {
    this._lines.push(line);
    this._currentLine = this._lines.length;
  }

  getCurrent() {
    return this._lines[this._currentLine];
  }

  getPrevious() {
    if (this._currentLine >= 0) {
      if (this._currentLine > 0) {
        this._currentLine--;
      }

      return this._lines[this._currentLine];
    }

    return this.getCurrent();
  }

  getNext() {
    if (this._currentLine < this._lines.length) {
      this._currentLine++;

      return this._lines[this._currentLine];
    }

    return this.getCurrent();
  }
}

export default CommandHistory;
