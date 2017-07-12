
/**
 * System base class.
 */
export class Updater {
  /**
   * Update the system.
   * @param {number} delta The engine delta.
   * @param {object} store The game engine store.
   */
  update(delta, store) {}
  /**
   * System reducer.
   * @param {object} state The state we are reducing from.
   * @param {object} action The action we may need to reduce.
   */
  reducer(state, action) {}
}
