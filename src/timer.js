import now from 'performance-now';

/**
 * Provides game timing.
 */
export class Timer {
  /**
   * Construct a new Timer.
   */
  constructor() {
    this._start = 0;
    this._current = 0;
    this._last = 0;
  }

  /**
   * Start the timer.
   */
  start() {
    this._start = now();
    this._current = this._start;
  }

  /**
   * Advance the clock by one step.
   */
  tick() {
    this._last = this._current;
    this._current = now();
  }

  /**
   * Get the current time in milliseconds.
   * @return {number} The time in ms.
   */
  getTime() {
    return this._current - this._start;
  }

  /**
   * Get the current delta.
   * @return {number} The delta in ms.
   */
  getDelta() {
    return this._current - this._last;
  }
}
