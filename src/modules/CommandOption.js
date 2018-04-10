'use strict';

class CommandOption {

  /**
   * Holds the available option types
   *
   * @return {{value_none: string, value_required: string, value_optional: string}}
   */
  static get types () {
    return {
      value_none:     'none',
      value_required: 'required',
      value_optional: 'optional'
    };
  }

  static get expressions () {
    return {
      value_none:     option => new RegExp( `^(--${option.longName}|-${option.shortName})`, 'i' ),
      value_required: option => new RegExp( `(?:--${option.longName}|-${option.shortName})(?:[= ])?(.*)`, 'i' ),
      value_optional: option => new RegExp( `(?:--${option.longName}|-${option.shortName})(?:[= ])?(.*)`, 'i' )
    };
  }

  /**
   * Creates a new option. All arguments but the long name are optional.
   *
   * @param {string} longName      option name to be used as "--long-name"
   * @param {string} [shortName]   short name to be used as "-s". will be automatically generated if omitted
   * @param {string} [type]        option type. must use one of the static types (@see CommandOption#types)
   * @param {string} [description] option description for the help text
   * @param {string} [valueLabel]  label for the command value used in the help text, if available
   */
  constructor (
    longName,
    shortName   = longName.substr( 0, 1 ),
    type        = this.constructor.types.value_none,
    description = '',
    valueLabel  = longName
  ) {
    this.longName    = longName;
    this.shortName   = shortName;
    this.type        = type;
    this.description = description;
    this.valueLabel  = valueLabel;
  }

  /**
   * Retrieves the option syntax help string
   *
   * @return {string}
   */
  get help () {
    return `-${this.shortName}, --${this.longName}` + ( this.isFlag ? '' : ` <${this.valueLabel || this.longName}>` );
  }

  /**
   * Whether this is a flag option (without a value)
   *
   * @return {boolean}
   */
  get isFlag () {
    return this.type === this.constructor.types.value_none;
  }
}

export default CommandOption;
