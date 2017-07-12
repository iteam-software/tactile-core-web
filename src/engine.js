
import {createStore, combineReducers} from 'redux';
import {OrderedMap} from 'immutable';
import {Updater} from './updater';
import {Renderer} from './renderer';
import {Timer} from './timer';

/**
 * The core engine class.
 */
export class Engine {
  /**
   * Construct a new engine in the stopped state.
   * @param {Store} state The redux game state.
   */
  constructor(state) {
    this._gameState = state || {};
    this._store = null;
    this._systems = new OrderedMap();
  }

  /**
   * Add a new system to the engine. Systems are updated in the order they
   * are added. If a system with the id of the added system already exists in
   * the engine, it will be replaced. A system is either a renderer or an
   * updater.
   * @param {Updater | Renderer} system The system to add to the engine.
   * @return {string} The id of the system that was added.
   */
  addSystem(system) {
    if (!system) {
      throw new Error('The system must be non-null.');
    }

    const id = Engine.getSystemId(system);
    if (system instanceof Updater || system instanceof Renderer) {
      this._systems = this._systems.set(id, system);
    } else {
      throw new Error('The system must be a Renderer or Updater');
    }

    return id;
  }

    /**
     * Remove a system from the engine. This method is idempotent.
     * @param {number | Updater | Renderer} system The id or system we want to
     * remove.
     */
  removeSystem(system) {
    let id = null;
    if (typeof system === 'string') {
      id = system;
    } else if (system instanceof Updater || system instanceof Renderer) {
      id = Engine.getSystemId(system);
    }

    if (id) {
      this._systems = this._systems.remove(id);
    }
  }

  /**
   * Get the system's id.
   * @param {System} system The system to get an id for.
   * @return {string} The Id of the system.
   */
  static getSystemId(system) {
    return system.constructor.name;
  }

  /**
   * Start the engine
   * @return {Promise} A promise that the engine will start.
   */
  start() {
    // We lock the systems when we begin to run
    const renderers = this._systems
      .filter((s) => s instanceof Renderer)
      .toArray();
    const updaters = this._systems
      .filter((s) => s instanceof Updater)
      .toArray();
    const reducers = updaters.map((s) => ({
      [Engine.getSystemId(s)]: s.reducer.bind(s),
    }));

    // Setup the store
    const systemReducers = Object.assign(...reducers);
    const rootReducer = combineReducers({
      engine: this._engineReducer.bind(this),
      ...systemReducers,
    });
    this._store = createStore(rootReducer, this._gameState);

    // Dispatch the start
    this._store.dispatch({
      type: 'Engine/Start',
    });

    return this._singleThreadedRun(updaters, renderers);
  }

  /**
   * Stop the engine.
   */
  stop() {
    this._store.dispatch({
      type: 'Engine/Stop',
    });
  }

  /**
   * Create an array of callbacks for the given method name mapped from the
   * given set of systems.
   * @param {Array} systems An array of systems from which to map callbacks.
   * @param {string} name The name of the callback to map.
   * @return {Array} An array of callbacks.
   */
  static makeSystemCallbacks(systems, name) {
    return systems.map((s) => s[name].bind(s));
  }

  /**
   * Begin a single threaded run.
   * @param {Array} updaters Array of system update functions.
   * @param {Array} renderers Array of renderer draw functions.
   * @return {Promise} The promise to run.
   */
  _singleThreadedRun(updaters, renderers) {
    const timer = new Timer();
    const renderCallbacks = Engine.makeSystemCallbacks(renderers, 'draw');
    const updateCallbacks = Engine.makeSystemCallbacks(updaters, 'update');

    return new Promise((resolve, reject) => {
      const tick = () => {
        const delta = timer.getDelta();
        const state = this._store.getState();

        try {
          this._runCallbacks(renderCallbacks, delta, state);
          this._runCallbacks(updateCallbacks, delta, this._store);
          timer.tick();
        } catch (e) {
          reject(e);
        }

        if (state.engine.isRunning) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };

      tick();
    });
  }

  /**
   * Redux reducer for the 'engine' substate.
   * @param {object} state The state we are reducing from.
   * @param {object} action The action we are reducing.
   * @return {object} The new state (or old if we don't handle this action).
   */
  _engineReducer(state = {isRunning: false}, {type}) {
    if (type === 'Engine/Start') {
      return Object.assign({}, state, {isRunning: true});
    } else if (type === 'Engine/Stop') {
      return Object.assign({}, state, {isRunning: false});
    }
    return state;
  }

  /**
   * Run a set of callbacks.
   * @param {Array} updaters An array of functions meant to run.
   * @param {number} delta The delta for this step.
   * @param {object} store The game store.
   */
  _runCallbacks(updaters, delta, store) {
    for (let i = 0; i < updaters.length; ++i) {
      updaters[i](delta, store);
    }
  }
}
