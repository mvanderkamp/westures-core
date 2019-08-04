/*
 * Contains various helpful utilities.
 */

'use strict';

/**
 * Performs a set filter operation.
 *
 * @private
 * @inner
 * @memberof westures-core.Region
 *
 * @param {Set} set - The set to filter.
 * @param {Function} predicate - Function to test elements of 'set'. Receives
 * one argument: the current set element.
 *
 * @return {Set} Set consisting of elements in 'set' for which 'predicate' is
 * true.
 */
function setFilter(set, predicate) {
  const result = new Set();
  set.forEach(element => {
    if (predicate(element)) {
      result.add(element);
    }
  });
  return result;
}

/**
 * Performs a set difference operation.
 *
 * @private
 * @inner
 * @memberof westures-core.Region
 *
 * @param {Set} left
 * @param {Set} right
 *
 * @return {Set} Set consisting of elements in 'left' that are not in
 * 'right'.
 */
function setDifference(left, right) {
  return setFilter(left, element => !right.has(element));
}

module.exports = Object.freeze({
  setDifference,
  setFilter,
});

