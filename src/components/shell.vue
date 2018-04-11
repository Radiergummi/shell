<template>
  <article class="shell" @click="focusStdIn">
    <section class="display" v-cloak>
      <ul class="lines">
        <li
          v-for="(line, index) in terminal.output"
          :key="index"
          :class="'line line-' + line.streamName"
        ><span v-if="line.prefix" class="prompt-string">{{ line.prefix}}</span><span
          class="line-text">{{ line.text }}</span>
        </li>
      </ul>
    </section>
    <footer :class="'stdin-area ' + (runningCommand ? 'hidden' : 'visible')">
      <span class="prompt-string">{{ terminal.standardInput.prompt }}</span>
      <input class="stdin"
             type="text"
             autofocus
             v-model="stdinValue"
             @keydown.enter="processCommand"
             @keyup.up="insertPreviousCommand"
             @keyup.down="insertNextCommand"
             @keydown.tab.stop.prevent="handleTab"
             @keydown.ctrl.76="handleClear"
             @keydown.ctrl.67="handleCancel"
             ref="stdin"
             title="STDIN"
      >
    </footer>
  </article>
</template>

<script>
  import AliasCommand   from '../modules/Commands/AliasCommand';
  import ClearCommand   from '../modules/Commands/ClearCommand';
  import CurlCommand    from '../modules/Commands/CurlCommand';
  import DateCommand    from '../modules/Commands/DateCommand';
  import EchoCommand    from '../modules/Commands/EchoCommand';
  import EnvCommand     from '../modules/Commands/EnvCommand';
  import HistoryCommand from '../modules/Commands/HistoryCommand';
  import ListCommand    from '../modules/Commands/ListCommand';
  import PromptCommand  from '../modules/Commands/PromptCommand';
  import SetCommand     from '../modules/Commands/SetCommand';
  import SleepCommand   from '../modules/Commands/SleepCommand';
  import UptimeCommand  from '../modules/Commands/UptimeCommand';
  import Terminal       from '../modules/Terminal';

  const commands = [
    new ListCommand(),
    new ClearCommand(),
    new EchoCommand(),
    new SleepCommand(),
    new DateCommand(),
    new AliasCommand(),
    new PromptCommand(),
    new EnvCommand(),
    new SetCommand(),
    new CurlCommand(),
    new HistoryCommand(),
    new UptimeCommand()
  ];

  export default {
    name: 'shell',

    data () {
      return {
        runningCommand: false,
        terminal:       new Terminal()
      };
    },

    computed: {
      stdinValue: {
        get () {
          return this.terminal.standardInput.read();
        },

        set ( newValue ) {
          this.terminal.standardInput.write( newValue );
        }
      }
    },

    watch: {

      /**
       * Scroll to the bottom of the container on scroll
       */
      output () {
        this.$nextTick( () => this.scrollToLastLine() );
      }
    },

    mounted () {
      this.$on( 'stdout', message => this.terminal.pushLine( message ) );
      this.$on( 'stderr', message => this.terminal.pushLine( message ) );
      this.$on( 'clear', () => this.terminal.flushLines() );

      for ( let command of commands ) {
        this.terminal.registerCommand( command );
      }
    },

    methods: {
      focusStdIn () {
        this.$refs.stdin.focus();
      },

      scrollToLastLine () {
        this.$el.scrollTo( 0, this.$el.scrollHeight );
      },

      async processCommand () {
        this.runningCommand = true;
        this.scrollToLastLine();

        return await this.terminal
                         .handle()
                         .then( () => this.$nextTick( () => {

                           // reset running command state
                           this.runningCommand = false;

                           // scroll into view
                           this.scrollToLastLine();
                         } ) );
      },

      insertPreviousCommand () {
        const previousLine = this.terminal.history.getPrevious();

        this.terminal.standardInput.write( !!previousLine ? previousLine.text : '' );
      },

      insertNextCommand () {
        const nextLine = this.terminal.history.getNext();

        this.terminal.standardInput.write( !!nextLine ? nextLine.text : '' );
      },

      handleTab () {
        console.log( 'tabbing' );
      },

      handleClear () {
        this.terminal.flushLines();
      },

      handleCancel () {

        // clear the input
        this.terminal.standardInput.clear();

        // cancel the currently running command
        this.terminal.cancel( '^C' );
      }
    }
  };
</script>

<style lang="scss">
  :root {
    --shell-background-color: black;
    --shell-color:            white;
    --shell-font-family:      monospace;
    --shell-font-size:        14px;

    --shell-padding:          5px;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    width:    100%;
    height:   100%;
    margin:   0;
    padding:  0;
    overflow: hidden;
  }

  .shell {
    position:        absolute;
    top:             0;
    right:           0;
    bottom:          0;
    left:            0;
    display:         flex;
    flex-direction:  column;
    justify-content: flex-start;
    width:           100vw;
    min-height:      100vh;
    padding:         var(--shell-padding);
    background:      var(--shell-background-color);
    font-family:     var(--shell-font-family);
    font-size:       var(--shell-font-size);
    color:           var(--shell-color);
    overflow-x:      hidden;
    overflow-y:      auto;
    line-height:     var(--shell-font-size);
  }

  .display {
    flex: 0 1 auto;
  }

  .stdin-area {
    flex:            1 1 auto;
    display:         flex;
    justify-content: flex-start;

    &.hidden {
      opacity: 0;
    }
  }

  .prompt-string {
    white-space: pre;
    opacity:     0.75;
  }

  .stdin {
    -webkit-appearance: none;
    width:              100%;
    height:             var(--shell-font-size);
    margin:             0;
    padding:            0;
    border:             0;
    background:         transparent;
    color:              inherit;
    font-family:        inherit;
    font-size:          inherit;
    line-height:        inherit;
    vertical-align:     middle
  }

  .stdin:focus {
    outline: none;
  }

  .lines {
    margin:      0;
    padding:     0;
    list-style:  none;
    color:       inherit;
    font-family: inherit;
    font-size:   inherit;
    line-height: inherit;

    .line {
      display:     flex;
      height:      var(--shell-font-size);
      margin:      0;
      padding:     0;
      line-height: inherit;
      min-height:  var(--shell-font-size);
      white-space: pre;

      .line-text {
        flex:        1 0 auto;
        white-space: inherit;
      }

      &.line-stderr {
        color: #ff557a;
      }
    }
  }
</style>
