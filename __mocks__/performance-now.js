'use strict';

let count = 0;

/**
 * Mocked now which returns an incrementing integer.
 * @return {number} The mocked now value.
 */
export default function now() {
  if (count > 1) {
    count = 0;
  }
  return ++count;
}
