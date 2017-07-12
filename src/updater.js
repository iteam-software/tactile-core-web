
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
  /**
   * System reducer.
   * @param {object} state The state we are reducing from.
   * @param {object} action The action we may need to reduce.
   */
  reducer(state, action) {
    throw new Error('Not implemented');
  }
}
