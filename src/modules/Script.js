'use strict';

class Script {

  /**
   * Creates the script instance
   *
   * @param {string} scriptText
   */
  constructor ( scriptText ) {
    this._raw   = scriptText;
    this._valid = null;
  }

  /**
   * Validates the script and returns the callback.
   *
   * @returns {Promise<Function>}
   */
  validate () {
    return new Promise( ( resolve, reject ) => {
      let executable;

      try {
        executable = new Function( 'input', 'output', 'terminal', 'global', '__filename', '__dirname', this._raw );

        this._valid = true;
        return resolve( executable );
      } catch ( error ) {
        this._valid = false;
        return reject( error.message );
      }
    } );
  }

  /**
   * Runs the script. This method accepts a context object used as the "thisArg", plus several
   * parameters that are passed down to the script function. This means that any of these will
   * be available to the script, while not being mandatory (just as in Node.js).
   * Due to the way the shell works, a script file can have almost the same scope as actual
   * command instances, minus the automatic argument definition and processing.
   *
   * @param  {Object}              context  context object used as the thisArg for the function
   * @param  {Input}               input    command input instance
   * @param  {Output}              output   command output instance
   * @param  {Terminal}            terminal terminal instance
   * @param  {Object}              global   global object
   * @param  {string}              filename script filename
   * @param  {string}              dirname  script directory path
   * @param  {*}                   args     args passed on the command line
   * @return {PromiseLike<Output>}
   */
  run ( context, input, output, terminal, global, filename, dirname, ...args ) {
    return this
      .validate()
      .then( executable => executable.call(
        context,
        input,
        output,
        terminal,
        global,
        filename,
        dirname,
        ...args
      ) )
      .then( () => output );
  }

  /**
   * Whether the script is valid. If it hasn't been validated yet, will validate.
   * Returns the callback script.
   *
   * @returns {Promise<Function>}
   */
  get valid () {
    if ( this._valid === null ) {
      return this.validate();
    }

    return Promise.resolve( this._valid );
  }
}

export default Script;
