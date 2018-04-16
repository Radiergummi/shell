'use strict';

import CommandArgument from './CommandArgument';
import CommandOption   from './CommandOption';

class Command {

  /**
   * Creates a new command
   *
   * @param {string} [name] command name. will default to removing "command" from the class name
   */
  constructor ( name = this.constructor.name.replace( 'Command', '' ).toLowerCase() ) {

    /**
     * Holds the current command name
     *
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * Holds the description for the current command
     *
     * @type {null}
     * @private
     */
    this._description = null;

    /**
     * Holds the usage information for the current command
     *
     * @type {null|string}
     * @private
     */
    this._usage = null;

    /**
     * Holds all argument definitions for the current command
     *
     * @type {Array}
     * @private
     */
    this._arguments = [];

    /**
     * Holds all option definitions for the current command
     *
     * @type {Array}
     * @private
     */
    this._options = [];

    this.addOption( 'help', 'h', CommandOption.types.value_none, 'Shows the command help' );
  }

  /**
   * Retrieves the command name
   *
   * @return {string}
   */
  getName () {
    return this._name;
  }

  setName ( value ) {
    this._name = value;
  }

  getDescription () {
    return this._description;
  }

  setDescription ( value ) {
    this._description = value;
  }

  getUsage () {
    if ( !this._usage ) {
      let usage = this.getName() + this._arguments.reduce( ( str, argument ) => ` ${argument.help}`, '' );

      // if we have fewer than 6 options, we'll print out each of them
      if ( this._options.length < 6 ) {
        const options = this._options.map(
          option => option.type === CommandOption.types.value_required
                    ? option.help
                    : `[${option.help}]`
        );

        usage += ` ${options.join( '' )}`;
      } else {

        // otherwise, show the [options] placeholder
        usage += ' [options]';
      }

      usage += '\n\n';

      const maximumOptionHelpLength = this._options.reduce( ( max, option ) => {
        const helpLength = option.help.length;

        return max > helpLength ? max : helpLength;
      }, 0 );

      this._options.forEach( option => {
        usage += `\n  ${option.help.padEnd( maximumOptionHelpLength )} ${option.description}`;
      } );

      usage += '\n';

      return usage;
    }

    return this._usage;
  }

  setUsage ( value ) {
    this._usage = value;
  }

  /**
   * Allows configuring the command
   */
  configure () {
    // this can be extended in children classes to avoid using the constructor
  }

  /**
   * Executes the command
   *
   * @param  {Input}      input  input interface
   * @param  {Output}     output output interface
   * @return {Promise<*>}
   */
  execute ( input, output ) {
    this.parseInput( input );

    if ( input.hasOption( 'help' ) ) {
      return Promise
        .resolve( this.getHelp( input, output ) )
        .then( () => output );
    }

    const context = {
      input,
      output,
      commands:    input.handler.commands,
      terminal:    output.terminal,
      storage:     output.terminal.storage,
      environment: output.terminal.environment,
      writeLine:   output.standardOutput.writeLine,
      write:       output.standardOutput.write,
      throw:       ( message, exitCode = 1 ) => {
        const error    = new Error( message );
        error.exitCode = exitCode;

        throw error;
      }
    };

    return Promise
      .resolve( this.run.call( context, input, output ) )
      .then( () => output );
  }

  /**
   *
   * @param {Input} input
   */
  parseInput ( input ) {

    // get a copy of the argv array
    const args = Array.from( input.argv );

    // iterate all options
    for ( let option of this._options ) {

      // iterate input arguments
      for ( let [ index, arg ] of args.entries() ) {
        if (
          typeof arg === 'string' &&
          arg.match( CommandOption.expressions.value_none( option ) )
        ) {

          // switch on the option type
          switch ( option.type ) {

            // command options without an input value
            case CommandOption.types.value_none:

              // store the matched option as a boolean true on the input value.
              // flags are automatically true if given, undefined (=falsy) otherwise.
              input.options.push( {
                                    name:  option.longName,
                                    value: true
                                  } );
              break;

            // command options with an optional input value
            case CommandOption.types.value_optional:
              let [ optionalValue ] = ( arg.match(
                CommandOption.expressions.value_optional( option )
              ) || [] ).slice( 1 );

              input.options.push( {
                                    name:  option.longName,
                                    value: optionalValue
                                  } );
              break;

            // command options with a required input value
            case CommandOption.types.value_required:
              let [ requiredValue ] = ( arg.match(
                CommandOption.expressions.value_required( option )
              ) || [] ).slice( 1 );

              if ( !requiredValue ) {
                throw new Error( `Syntax error: Missing required value for option ${option.help}` );
              }

              // store the matched value on the input data
              input.options.push( {
                                    name:  option.longName,
                                    value: requiredValue
                                  } );

              break;
          }

          // check if we've got the option registered
          if ( input.hasOption( option.longName ) ) {

            // remove the processed option from the args
            args.splice( index, 1 );
          }
        }
      }

      // we've got a required option but no more input arguments,
      // so the option seems to be missing
      if (
        !input.hasOption( option.longName ) &&
        option.type === CommandOption.types.value_required
      ) {
        throw new Error( `Syntax error: Missing required option ${option.help}` );
      }
    }

    // iterate all arguments
    for ( let argument of this._arguments ) {

      let value;

      // check if there are no more arguments left
      if ( args.length === 0 ) {

        // check if the argument is required
        if ( argument.type === CommandArgument.types.value_required && !input.hasOption( 'help' ) ) {
          throw new Error( `Missing required argument: ${argument.help}` );
        }

        // check if the argument is optional, in which case assign the default
        if (
          argument.type === CommandArgument.types.value_optional &&
          argument.fallback !== null
        ) {
          value = argument.fallback;
        }
      } else {

        // otherwise, just shift the args to receive the value
        value = args.shift();
      }

      input.arguments.push( {
                              name: argument.name,
                              value
                            } );
    }
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    throw new Error( 'Command must not be directly invoked' );
  }

  /**
   * Retrieves the help text
   * @param input
   * @param output
   */
  getHelp ( input, output ) {
    output.standardOutput.writeLine( 'Usage:' );
    this.getUsage().split( '\n' ).forEach( line => output.standardOutput.writeLine( line ) );
    output.standardOutput.writeLine( '' );

    if ( this.getDescription() ) {
      output.standardOutput.writeLine( 'Description:' );
      output.standardOutput.writeLine( this.getDescription() );
    }

    output.standardOutput.writeLine( '' );
  }

  /**
   * Adds a new argument to the command
   *
   * @param {string} name           argument name
   * @param {string} [argumentType] argument type. must use one of the static types (@see CommandArgument#types)
   * @param {string} [description]  argument description for the help text
   * @param {*}      [fallback]     fallback value if missing. Can only be used for optional arguments
   */
  addArgument (
    name,
    argumentType = this.constructor.argumentTypes.required,
    description  = '',
    fallback     = null
  ) {
    this._arguments.push( new CommandArgument(
      name,
      argumentType,
      description,
      fallback
    ) );
  }

  /**
   * Adds a new option to the command
   *
   * @param {string} longName
   * @param {string} shortName
   * @param {string} optionType
   * @param {string} description
   * @param {string} valueLabel
   */
  addOption (
    longName,
    shortName   = longName.substr( 0, 1 ),
    optionType  = CommandOption.types.value_none,
    description = '',
    valueLabel  = ''
  ) {
    if ( !this.hasOption( longName ) ) {
      this._options.push( new CommandOption(
        longName,
        shortName,
        optionType,
        description,
        valueLabel
      ) );
    } else {
      /** @type {CommandOption} option */
      const option = this._options.find( option => option.longName === longName );

      if ( option ) {
        option.longName    = longName;
        option.shortName   = shortName;
        option.type        = optionType;
        option.description = description;
        option.valueLabel  = valueLabel;
      }
    }
  }

  /**
   * Checks whether the command has an option
   *
   * @param  {string}  name long name of the option
   * @return {boolean}
   */
  hasOption ( name ) {
    return !!this._options.find( option => option.longName === name );
  }
}

export default Command;
