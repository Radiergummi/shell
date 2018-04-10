'use strict';

/**
 * Output line
 */
class Line {

  /**
   * Retrieves the default stream names
   *
   * @return {{standardOutput: string, standardError: string}}
   */
  static get streamNames () {
    return {
      standardOutput: 'stdout',
      standardError:  'stderr'
    };
  }

  /**
   * Creates a new line
   *
   * @param {string} text       line text
   * @param {string} streamName stream name
   * @param {string} prefix     line text prefix used in the display name
   */
  constructor ( text = '', streamName = Line.streamNames.standardOutput, prefix = '' ) {
    this.text       = text;
    this.streamName = streamName;
    this.prefix     = prefix;
    this.date       = new Date();
  }

  /**
   * Retrieves the line display text
   *
   * @return {string}
   */
  get displayText () {
    return this.prefix + this.text;
  }

  get empty() {
    return this.text.length === 0;
  }
}

export default Line;
