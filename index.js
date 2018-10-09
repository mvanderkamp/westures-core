/**
 * @file index.js
 * Main object containing API methods and Gesture constructors
 */

const Region  = require('./src/Region.js');
const Gesture = require('./src/Gesture.js');

/**
 * The global API interface for Westures. Contains a constructor for the Region
 * Object and the generic Gesture class for user gestures to implement.
 *
 * @type {Object}
 * @namespace Westures
 */
module.exports = {
  Gesture,
  Region,
};

