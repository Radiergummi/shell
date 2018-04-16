'use strict';

import CommandHandler    from './CommandHandler';
import CommandHistory    from './CommandHistory';
import FileOutputStream  from './Filesystem/FileOutputStream';
import VirtualFilesystem from './Filesystem/VirtualFilesystem';
import Input             from './Input';
import Line              from './Line';
import Output            from './Output';
import StandardInput     from './StandardInput';

class Terminal {
  constructor ( global ) {
    this._global = global;

    /**
     * Holds the application storage disks
     *
     * @type {VirtualFilesystem}
     */
    this.storage = null;

    /**
     * Holds the current cancellation status. In order to quit the command promise once a cancel signal
     * has been received, this variable keeps track of the current cancellation status.
     *
     * @type {number}
     * @private
     */
    this._cancellationState = 0;

    /**
     * Holds the current output lines
     *
     * @type {Line[]}
     */
    this.output = [];

    /**
     * Holds the standard input instance
     *
     * @type {StandardInput}
     */
    this.standardInput = new StandardInput( this );

    /**
     * Holds the command history instance
     *
     * @type {CommandHistory}
     */
    this.history = new CommandHistory();

    /**
     * Holds the command handler instance
     *
     * @type {CommandHandler}
     */
    this.handler = new CommandHandler();

    /**
     * Holds the environment variables
     *
     * @type {object}
     */
    this.environment = {
      pwd:          '/',
      user:         'test',
      hostname:     window.location.hostname,
      lastExitCode: 0,
      bootTime:     new Date()
    };

    this.style = {
      background: 'black',
      foreground: 'white'
    };

    this.environment.promptString = `$user@$hostname $pwd # `;
  }

  loadStorage ( disks ) {
    this.storage = new VirtualFilesystem( disks );

    this.setEnv( 'pwd', this.storage.path );
  }

  setForeground ( color = 'inherit' ) {
    this.style.foreground = color;
  }

  setBackground ( color = 'inherit' ) {
    this.style.background = color;
  }

  /**
   * Registers a new command on the terminal
   *
   * @param {Command} command
   */
  registerCommand ( command ) {
    this.handler.register( command );
  }

  /**
   * Retrieves an environment variable
   *
   * @param  {string} variable   variable name
   * @param  {*}      [fallback] optional fallback value
   * @return {*}
   */
  getEnv ( variable, fallback = null ) {
    if ( this.environment.hasOwnProperty( variable ) ) {
      return this.environment[ variable ];
    }

    return fallback;
  }

  /**
   * Sets an environment variable
   *
   * @param {string} variable
   * @param {*}      value
   */
  setEnv ( variable, value ) {
    this.environment[ variable ] = value;
  }

  substitute ( text ) {
    let matches;
    let iteration = 0;

    // loop over any variable substitutes in the value, stopping after 2048 iterations.
    // this is a safeguard to prevent and endless loop in case of failure.
    while ( ( matches = text.match( /\$\w+/ig ) ) !== null && iteration !== 2048 ) {
      let matched = matches[ 0 ].slice( 1 );

      // try to fetch the variable from the environment, use the match otherwise
      let variable = this.environment.hasOwnProperty( matched )
                     ? this.environment[ matched ]
                     : matched;

      text = text.replace(
        matches[ 0 ],
        variable
      );
      iteration++;
    }

    return text;
  }

  /**
   * Pushes a new line to the output
   *
   * @param {Line} line
   */
  pushLine ( line ) {
    this.output.push( line );
  }

  /**
   * Flushes all output lines
   */
  flushLines () {
    this.output = [];
  }

  /**
   * Cancels an ongoing command by updating the cancellation status
   *
   * @param {string} [reason] reason for the cancellation
   */
  cancel ( reason = '' ) {
    this._cancellationReason = reason;
    this._cancellationState  = 1;
  }

  /**
   * Provides a cancellator callback. Now, this is a little convoluted... to be able to cancel just about
   * any promise, we need a race condition. The promise returned by the cancellator sets up an interval
   * to be executed every 10ms. Due to the callback being bound to the Terminal instance, the interval
   * has access to the scope variables - including cancellation state and reason.
   * As soon as the state changes, the promise is rejected, resulting in the race condition being ended
   * and the actual command promise being terminated.
   * To make sure the interval is being cleared if a command runs without being cancelled, we need a
   * third state: Completed. If the complete signal is picked up, the interval is cleared and the state
   * reset.
   * I'm sure there are more beautiful solutions to the problem, but I didn't want to include Bluebird
   * or have commands polluted with cancellation logic, so here we are.
   *
   * @return {function(): Promise<*>}
   * @private
   */
  static get _cancellator () {

    // return a function so it can be bound to the correct scope
    return function () {
      return new Promise( ( resolve, reject ) => {

        // set up the state checking interval to run every 10ms
        const interval = setInterval( () => {

          // if state signal is "cancel"
          if ( this._cancellationState === 1 ) {

            // clear the interval
            clearInterval( interval );

            // set state signal to "wait"
            this._cancellationState = 0;

            // reject with the provided reason, thus ending the race
            return reject( this._cancellationReason );
          }

          // if state signal is "completed"
          if ( this._cancellationState === 2 ) {

            // just clear the interval
            clearInterval( interval );

            // reset the state signal to "wait"
            this._cancellationState = 0;
          }
        }, 10 );
      } );
    };
  }

  /**
   * Runs each queue call sequentially
   *
   * @param  {Array}         queue
   * @return {Promise<void>}
   */
  async processQueue ( queue ) {
    for ( const call of queue ) {
      await this.handleCall( call );
    }
  }

  /**
   * Handles the input queue
   *
   * @return {Promise<void>}
   */
  async handle () {

    // create a new line
    const line = new Line(
      this.standardInput.read(),
      Line.streamNames.stdout,
      this.standardInput.prompt
    );

    // write the input to the output
    this.pushLine( line );

    // clear the input
    this.standardInput.clear();

    // if we don't have text, stop here
    if ( line.empty ) {
      return;
    }

    // create history entry
    this.history.push( line );

    const queue = line.text.split( ' && ' );

    await this.processQueue( queue );
  }

  /**
   * Handles a single queue call
   *
   * @param  {string}        call
   * @return {Promise<void>}
   */
  async handleCall ( call ) {
    try {
      let redirection;

      if ( call.match( / > / ) ) {
        [ call, redirection ] = call.split( ' > ' );
      }

      // set up a race condition between actual command and cancellator
      const output = await Promise
        .race(
          [
            this.handler.handle(
              new Input( this, call ),
              new Output( this, redirection ? new FileOutputStream( this.storage.find( redirection ) ) : undefined )
            ),

            this.constructor._cancellator.call( this )
          ]
        )
        .then( output => {
          this._cancellationState  = 2;
          this._cancellationReason = null;

          return output;
        } );

      for ( let line of output.buffer ) {

        // write the command output
        this.pushLine( line );
      }

      this.environment.lastExitCode = 0;
    }

    catch ( error ) {

      // dump error to browser console
      console.error( error );

      this.environment.lastExitCode = error.exitCode || 1;

      this.pushLine( new Line( error.message || error, Line.streamNames.standardError ) );
    }
  }
}

export default Terminal;
