'use strict';

import Command from '../Command';

class UptimeCommand extends Command {
  configure () {
    this.setName( 'uptime' );
    this.setDescription( 'Show time elapsed since boot' );
  }

  run ( input, output ) {
    const now         = new Date();
    const boot        = output.terminal.getEnv( 'bootTime' );
    const currentTime = now.toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } );

    function _diff ( left, right ) {
      const second = 1000,
            minute = second * 60,
            hour   = minute * 60,
            day    = hour * 24;
      const diff   = right - left;

      return {
        days:    Math.floor( diff / day ),
        hours:   String( Math.floor( diff / hour ) ).padStart( 2, '0' ),
        minutes: String( Math.floor( diff / minute % 60 ) ).padStart( 2, '0' )
      };
    }

    const up = _diff( boot, now );

    output.standardOutput.writeLine( `${currentTime}\tup ${up.days} days, ${up.hours}:${up.minutes}` );
  }
}

export default UptimeCommand;
