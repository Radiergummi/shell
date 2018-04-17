# shell

> A flexible in-browser shell

Yaaay, yet another clumsy pseudo-shell for the browser! **But wait**.  
This is not an attempt to create just something that looks like a shell, but something that actually *feels* like one.
Usually you can tell how bad it's made just by trying CTRL+L. I didn't want that.

## Features
 - Promise-based commands, cancelable nevertheless (via CTRL+C, for example)
 - Command design inspired by Symfony console, including automatically generated command help and input validation
 - Full variable substitution, even for commands (parsing happens before command interpretation)
 - Command history, chainable commands, command aliases, exit codes and more
 - Virtual file system, ability to plug in actual remote file systems or the browser's local storage

## Try it
Shell is automatically deployed here:

[shell.9dev.de](https://shell.9dev.de)


## Motivation
Well, yeah. Why do you do things? Because you can. This is a little experiment to see how far I can get. Having solved
asynchronous command chains, input/output streams and promise interruptions, I'm confident there's not much that just
won't work in the browser, but we'll see.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and 
[docs for vue-loader](http://vuejs.github.io/vue-loader). This is just a simple Vue app, which makes development more
comfortable and abstracts the browser away neatly.  
Vue is, however, *not* actually in use for the terminal implementation, that's pure JS.

# Show me the darn code already!
Here you go.

## Implementing commands
Commands must inherit from the [`modules/Command`](./src/modules/Command.js) class, which provides a few things, 
such as:

 - Help and usage information generation
 - Input parsing and scope definition
 - Promise wrapping

Since the hard parts are abstracted away, a basic command looks like this:

````javascript
import Command from './src/modules/Command';

class ArbitraryCommand extends Command {
  configure() {
    this.setName('arbitrary');
    this.setDescription('My awesomely useless command');
    
    this.addArgument('number', CommandArgument.types.value_required, 'Number to double');
  }

  run(input, output) {
    const number = input.getArgument('number');

    this.writeLine(`Fun fact: If you double ${number}, it'll be ${number * 2}!`);
  }
}
````

That doesn't look like much, does it? Yet, under the hood, a lot has happened. As soon as you load this command, several
things happen:
 - Your command will be visible to `list`, meaning it will show up (including it's description) in the list of available
   commands. [More...](#the-list-command)
 - You can run `arbitrary --help` or `-h` and a full help text including syntax info will show on the output.
   [More...](#automatic-help)
 - All arguments are automatically parsed, so by passing a collection of digits (wise man seem to call them "numbers"),
   you will actually receive a `Number` in your `run()` method.
 - All arguments are validated and any errors will cause the command to exit with a non-zero status code. Rest assured
   that all required arguments will be available.

Additionally, you can return a promise at any point. All command callbacks are wrapped in one, which enables smooth
asynchronous experience. The shell will wait for your command to resolve, which is why the
[curl command](./src/modules/Commands/CurlCommand.js) works fine. You can also throw an error at any time, which will
cause the command to exit with -- you guessed it probably -- a non-zero status code, printing the error message to
STDERR.


### The list command
While the list command is just an ordinary command you could easily recreate (no special hacks or anything, really), it
takes bit of a special role since it dynamically lists all available commands. As soon as a command is loaded, it will
be automatically listed here, including its description.

### Automatic help
Help is generated using the information you provide, plus anything that can be inferred from the code.

## Implementing filesystems

All filesystems inherit from the [`Filesystem`](./src/Filesystem.js) base class. There are two hooks of primary
interest: `initialize` and `release`, which your filesystem should use to load and persist data. You're free, however,
to replace any methods or properties to implement real-time persistence.

Let's look at the default, [`LocalStorageFilesystem`](./src/modules/Filesystem/LocalStorageFilesystem.js):

```js
class LocalStorageFilesystem extends JsonFilesystem {
  constructor ( name, keyName = name ) {
    super( name, LocalStorageFilesystem._readLocalStorageItem( keyName ) );
  }

  static _readLocalStorageItem ( path ) {
    return window.localStorage.getItem( path ) || '{}';
  }

  static _writeLocalStorageItem ( path, content ) {
    window.localStorage.setItem( path, JSON.stringify( content ) );
  }
}
```

It uses the constructor to initialize
