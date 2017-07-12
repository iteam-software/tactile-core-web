
import {System} from './system';

/**
 * Base renderer class.
 */
export class Renderer extends System {
  /**
   * Draw.
   * @param {number} delta The time delta
   * @param {object} state The current state.
   */
  draw(delta, state) {
    throw new Error('Not implemented');
  }
}
