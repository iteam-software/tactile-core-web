
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
    this._timer = new Timer();
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

    const id = this.getSystemId(system);
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
      id = this.getSystemId(system);
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
  getSystemId(system) {
    return system.constructor.name;
  }

  /**
   * @return {Promise} A promise that will resolve 
   */
  run() {
    const os = require('os');
    this._isRunning = true;
    this._timer.start();
    let delta = this._timer.getDelta();

    // We lock the systems when we begin to run
    const systems = this._systems.toArray();
    const reducers = systems.map((s) => ({
      [this.getSystemId(s)]: s.reducer,
    }));

    // Setup the store
    const rootReducer = combineReducers(Object.assign(...reducers));
    this._store = createStore(rootReducer, this._gameState);

    return new Promise((resolve, reject) => {
      const tick = () => {
        delta = this._timer.getDelta();
        try {
          // Update and render cycles.
          for (let index = 0; index < systems.length; ++index) {
            systems[index].update(delta, this._store);
          }
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
   * 
   */
  stop() {
    this._isRunning = false;
  }

  /**
   * Execute a single threaded pass.
   * @param {Array} systems Array of system update functions.
   * @param {Array} renderers Array of renderer draw functions.
   * @param {number} delta The current timestep.
   */
  async _singleThreadedRun(systems, renderers, delta) {
    await this._runUpdater(renderers, delta, this._store.getState());
    await this._runUpdater(systems, delta, this._store);
  }

  _multiThreadedRun(systems, renderers, timer) {
    const cluster = require('cluster');
    if (cluster.isMaster) {
      const renderer = cluster.fork();
    } else {

    }
  }

  /**
   * Run some updaters.
   * @param {Array} updaters An array of functions meant to update.
   * @param {number} delta The delta for this step.
   * @param {object} store The game store.
   * @return {Promise} A promise to update.
   */
  _runUpdater(updaters, delta, store) {
    return new Promise((resolve, reject) => {
      try {
        for (let i = 0; i < updaters.length; ++i) {
          updaters[i](delta, store);
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
