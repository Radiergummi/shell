'use strict';

class Input {

  /**
   * Creates a new input interface
   *
   * @param {Terminal} terminal
   * @param {string} text
   */
  constructor ( terminal, text ) {

    /**
     * Holds the terminal instance
     *
     * @type {Terminal}
     */
    this.terminal = terminal;

    this._raw = text;

    const [ commandName, ...argv ] = this._parseArguments( text );

    /**
     * Holds the command name
     *
     * @type {string}
     */
    this.commandName = commandName;

    /**
     * Holds the command arguments
     *
     * @type {Array}
     */
    this.argv = argv;

    /**
     * Holds the command handler instance
     *
     * @type {CommandHandler}
     */
    this.handler = null;

    this.arguments = [];

    this.options = [];
  }

  hasOption ( name ) {
    for ( let option of this.options ) {
      if ( option.name === name && option.value ) {
        return true;
      }
    }

    return false;
  }

  getOption ( name, fallback = null ) {
    if ( this.hasOption( name ) ) {
      const option = this.options.find( option => option.name === name );

      if ( option ) {
        return option.value;
      }
    }

    return fallback;
  }

  addOption ( name, value ) {
    if ( this.hasOption( name ) ) {
      const option = this.options.find( option => option.name === name );

      if ( option ) {
        option.value = value;
      }
    } else {
      this.options.push( { name, value } );
    }
  }

  hasArgument ( name ) {
    for ( let argument of this.arguments ) {
      if ( argument.name === name && argument.value ) {
        return true;
      }
    }

    return false;
  }

  getArgument ( name, fallback = null ) {
    if ( this.hasArgument( name ) ) {
      const argument = this.arguments.find( argument => argument.name === name );

      if ( argument ) {
        return argument.value;
      }
    }

    return fallback;
  }

  addArgument ( name, value ) {
    if ( this.hasArgument( name ) ) {
      const argument = this.arguments.find( argument => argument.name === name );

      if ( argument ) {
        argument.value = value;
      }
    } else {
      this.arguments.push( { name, value } );
    }
  }

  parseArgument ( arg ) {
    return this._parseArgument( arg );
  }

  create ( newText = this._raw ) {
    const input   = new Input( this.terminal, newText );
    input.handler = this.handler;

    return input;
  }

  /**
   * Parses the command
   *
   * @param  {string}   text
   * @return {string[]}
   */
  _parseArguments ( text ) {
    const parts       = [];
    let quotesOpen    = false;
    let lastQuoteChar = '';
    let currentPart   = '';

    for ( let i = 0; i < text.length; i++ ) {
      const char = text.charAt( i );

      if ( quotesOpen && char === lastQuoteChar ) {
        parts.push( currentPart );
        currentPart   = '';
        lastQuoteChar = '';
        quotesOpen    = false;
        continue;
      }

      if ( !quotesOpen && ( char === '"' || char === '\'' ) ) {
        quotesOpen    = true;
        lastQuoteChar = char;
        continue;
      }

      // white space
      if ( char.match( /\s+/ ) && !quotesOpen ) {
        if ( currentPart.length > 0 ) {
          parts.push( currentPart );
          currentPart = '';
        }

        continue;
      }

      currentPart += char;
    }

    if ( currentPart.length > 0 ) {
      parts.push( currentPart );
    }

    return parts.map( arg => this._parseArgument( arg ) );
  }

  /**
   * Parses individual arguments. This includes a basic variable substitution happening before
   * the actual command parsing, so yes, you can call commands in variables.
   *
   * @param  {string} arg argument string
   * @return {*}          parsed argument
   * @private
   */
  _parseArgument ( arg ) {
    arg = this.terminal.substitute( arg );

    if ( [ 'true', 'yes' ].includes( arg ) ) {
      return true;
    }

    if ( [ 'false', 'no' ].includes( arg ) ) {
      return false;
    }

    if ( isNaN( arg ) === false ) {
      return Number( arg );
    }

    return arg;
  }
}

export default Input;
