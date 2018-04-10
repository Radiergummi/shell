'use strict';

import Command         from '../Command';
import CommandArgument from '../CommandArgument';
import Input           from '../Input';

class PromptCommand extends Command {

  configure () {
    this.setName( 'prompt' );
    this.setDescription( 'Changes the prompt string' );

    this.addArgument( 'newPrompt', CommandArgument.types.value_required, 'New prompt string' );
  }

  /**
   * Runs the command
   *
   * @param {Input}  input  input interface
   * @param {Output} output output interface
   */
  run ( input, output ) {
    this.terminal.environment.promptString = input.getArgument( 'newPrompt' );
  }
}

export default PromptCommand;
