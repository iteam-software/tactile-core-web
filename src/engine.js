
import {createStore, combineReducers} from 'redux';
import {System} from './system';
import {OrderedMap} from 'immutable';
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
    this._isRunning = false;
    this._store = null;
    this._systems = new OrderedMap();
    this._renderers = new OrderedMap();
    this._gameState = state || {};
  }

  /**
   * Add a new system to the engine. Systems are updated in the order they
   * are added. If a system with the id of the added system already exists in
   * the engine, it will be replaced.
   * @param {System} system The system to add to the engine.
   * @return {string} The id of the system that was added.
   */
  addSystem(system) {
    if (!system || !(system instanceof System)) {
      throw new Error('The system must be of type Tactile.System.');
    }

    const id = Engine.getSystemId(system);
    this._systems = this._systems.set(id, system);

    return id;
  }

  /**
   * Attempts to remove the given system from the engine. This method is
   * idempotent.
   * @param {string | System} system The system (or id) to remove.
   */
  removeSystem(system) {
    let id;
    if (typeof system === 'string') {
      id = system;
    } else if (system instanceof System) {
      id = Engine.getSystemId(system);
    }

    if (id) {
      this._systems = this._systems.delete(id);
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
    this._isRunning = true;

    // We lock the systems when we begin to run
    const renderers = this._renderers.toArray();
    const systems = this._systems.toArray();
    const reducers = systems.map((s) => ({
      [Engine.getSystemId(s)]: s.reducer,
    }));

    // Setup the store
    const rootReducer = combineReducers(Object.assign(...reducers));
    this._store = createStore(rootReducer, this._gameState);

    return this._singleThreadedRun(systems, renderers);
  }

  /**
   * Stop the engine.
   */
  stop() {
    this._isRunning = false;
  }

  /**
   * 
   * @param {Array} systems The systems array
   * @return {Array} An array of update callbacks.
   */
  static makeUpdaters(systems) {
    return systems.map((s) => s.update.bind(s));
  }

  /**
   * 
   * @param {Array} renderers The renderers to extract the draw from.
   * @return {Array} An array of draw callbacks.
   */
  static makeRenderers(renderers) {
    return renderers.map((r) => r.draw.bind(r));
  }

  /**
   * Begin a single threaded run.
   * @param {Array} systems Array of system update functions.
   * @param {Array} renderers Array of renderer draw functions.
   * @return {Promise} The promise to run.
   */
  _singleThreadedRun(systems, renderers) {
    const timer = new Timer();
    const renderUpdaters = Engine.makeRenderers(renderers);
    const systemUpdaters = Engine.makeUpdaters(systems);

    return new Promise((resolve, reject) => {
      const tick = () => {
        const delta = timer.getDelta();
        const state = this._store.getState();

        try {
          this._runUpdater(renderUpdaters, delta, state);
          this._runUpdater(systemUpdaters, delta, this._store);
          timer.tick();
        } catch (e) {
          reject(e);
        }

        if (this._isRunning) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };

      tick();
    });
  }

  /**
   * Run some updaters.
   * @param {Array} updaters An array of functions meant to update.
   * @param {number} delta The delta for this step.
   * @param {object} store The game store.
   */
  _runUpdater(updaters, delta, store) {
    for (let i = 0; i < updaters.length; ++i) {
      updaters[i](delta, store);
    }
  }
}
