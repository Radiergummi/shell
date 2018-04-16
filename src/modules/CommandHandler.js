'use strict';

class CommandHandler {

  /**
   * Creates a new command handler
   *
   * @param {Command[]} commands
   */
  constructor ( commands = [] ) {

    /**
     * Holds all commands available throughout the application
     *
     * @type {Object}
     */
    this.commands = {};

    for ( let command of commands ) {
      this.register( command );
    }
  }

  /**
   * Handles a command request
   *
   * @param  {Input}      input
   * @param  {Output}     output
   * @return {Promise<*>}
   */
  handle ( input, output ) {
    return new Promise( ( resolve, reject ) => {
      if (
        this.hasCommand( input.commandName )
      ) {
        input.handler = this;

        return resolve( this.commands[ input.commandName ].execute( input, output ) );
      }

      return reject( `shell: ${input.commandName}: command not found` );
    } );
  }

  /**
   * Creates a command alias
   *
   * @param {string} alias   new alias name
   * @param {string} command existing command name
   */
  alias ( alias, command ) {
    this.commands[ alias ] = this.commands[ command ];
  }

  /**
   * Checks whether a given command is registered and not an invalid alias
   *
   * @param  {string}  command
   * @return {boolean}
   */
  hasCommand ( command ) {
    return (
      Object.keys( this.commands ).includes( command ) &&
      typeof this.commands[ command ] !== 'undefined'
    );
  }

  /**
   * Registers a command on the handler
   *
   * @param {Command} command
   */
  register ( command ) {
    if ( !this.hasCommand( command.getName() ) ) {
      command.configure();

      this.commands[ command.getName() ] = command;
    }
  }

  /**
   * Runs another command
   *
   * @param  {string}     command
   * @param  {Input}      input
   * @param  {Output}     output
   * @return {Promise<*>}
   */
  run ( command, input, output ) {
    input.commandName = command;

    return this.handle( input, output );
  }
}

export default CommandHandler;
