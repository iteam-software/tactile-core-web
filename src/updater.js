
import {System} from './system';

/**
 * System base class.
 */
export class Updater extends System {
  /**
   * Update the system.
   * @param {number} delta The engine delta.
   * @param {object} store The game engine store.
   */
  update(delta, store) {
    throw new Error('Not implemented');
  }
}
