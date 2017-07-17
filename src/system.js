
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
  componentsReducer(state = new Map(), {type, id, systems, ...action}) {
    switch (type) {
      case 'Entity/Position':
        if (state.has(id)) {
          const component = state.get(id);
          return state.set(id, this.updatePosition(component, action.position));
        }
        break;
      case 'Entity/Create':
      case 'Entity/Add':
        if (systems.includes(this.getSystemId())) {
          return state.set(id, this.makeComponent(action));
        }
        break;
      case 'Entity/Destroy':
      case 'Entity/Remove':
        if (systems.includes(this.getSystemId())) {
          return state.delete(id);
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
   * System reducer.
   * @param {object} state The state we are reducing from.
   * @param {object} action The action we may need to reduce.
   */
  reducer(state, action) {
    throw new Error('Not implemented');
  }

  /**
   * Create a new component.
   * @param {object} init the initialization data for this component.
   */
  makeComponent(init) {
    throw new Error('Not implemented');
  }

  /**
   * Update the position of the given component.
   * @param {object} component The component to update the position for
   * @param {object} position The new position.
   * @return {object} The updated component.
   */
  updatePosition(component, position) {
    component.position = position;
    return component;
  }
}
