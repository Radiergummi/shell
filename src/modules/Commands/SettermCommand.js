'use strict';

import Command       from '../Command';
import CommandOption from '../CommandOption';

class SettermCommand extends Command {
  configure () {
    this.setName( 'setterm' );
    this.setDescription( 'Allows to set various terminal settings' );

    this.addOption(
      'foreground',
      'f',
      CommandOption.types.value_optional,
      'Allows to set the foreground color',
      'color'
    );

    this.addOption(
      'background',
      'b',
      CommandOption.types.value_optional,
      'Allows to set the background color',
      'color'
    );

    this.addOption(
      'reset',
      'r',
      CommandOption.types.value_none,
      'Resets the terminal to the default settings'
    );
  }

  run ( input, output ) {
    console.log( input );
    if ( input.getOption( 'reset' ) ) {
      output.terminal.setForeground();
      output.terminal.setBackground();

      return;
    }

    if ( input.hasOption( 'foreground' ) ) {
      const foregroundColor = input.getOption( 'foreground' );
      output.terminal.setForeground( foregroundColor );
    }

    if ( input.hasOption( 'background' ) ) {
      const backgroundColor = input.getOption( 'background' );
      output.terminal.setBackground( backgroundColor );
    }
  }
}

export default SettermCommand;
