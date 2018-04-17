'use strict';

class CommandArgument {

  /**
   * Holds the available argument types
   *
   * @return {{value_required: string, value_optional: string, value_array: string}}
   */
  static get types () {
    return {
      value_required: 'required',
      value_optional: 'optional',
      value_array:    'array'
    };
  }

  /**
   * Creates a new argument. All arguments but the name are optional.
   *
   * @param {string} name          argument name
   * @param {string} [type]        argument type. must use one of the static types (@see CommandArgument#types)
   * @param {string} [description] argument description for the help text
   * @param {*}      [fallback]    fallback value if missing. Can only be used for optional arguments
   */
  constructor (
    name,
    type        = this.constructor.types.value_optional,
    description = '',
    fallback    = null
  ) {
    this.name        = name;
    this.type        = type;
    this.description = description;
    this.fallback    = fallback;
  }

  /**
   * Retrieves the argument syntax help string
   *
   * @return {string}
   */
  get help () {
    return this.name.toUpperCase();
  }
}

export default CommandArgument;
