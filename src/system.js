
import {Map} from 'immutable';

/**
 * Provides the base system class used by updaters and renderers.
 */
export class System {
  /**
   * Reduce the component set if we need to.
   * @param {Map} state The map of components this system is interested in.
   * @param {object} action The action we may want to handle
   * @return {Set} The new state.
   */
  componentsReducer(state = new Map(), {type, ...action}) {
    switch (type) {
      case 'Entity/Position':
        if (state.has(action.id)) {
          const {position, ...rest} = state.get(action.id);
          return state.merge([{position, ...rest}]);
        }
        break;
      case 'Entity/Create':
      case 'Entity/Add':
        if (action.systems.includes(this.getSystemId())) {
          return state.set(action.id, this.makeComponent(action));
        }
        break;
      case 'Entity/Destroy':
      case 'Entity/Remove':
        if (action.system.includes(this.getSystemId())) {
          return state.delete(action.id);
        }
        break;
      case `${this.getSystemId()}/Update`:
        return state.merge(action.components);
      default:
        break;
    }
    return state;
  }

  /**
   * Returns the id of this system.
   * @return {string} The system id.
   */
  getSystemId() {
    return this.constructor.name;
  }

  /**
   * Create a new component.
   * @param {object} init the initialization data for this component.
   */
  makeComponent(init) {
    throw new Error('Not implemented');
  }
}
