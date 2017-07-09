
import {System} from './system';
import {OrderedMap} from 'immutable';

/**
 * The core engine class.
 */
export class Engine {
  /**
   * Construct a new engine in the stopped state.
   * @param {Store} state The redux game state.
   */
  constructor(state) {
    this.isRunning = false;
    this.systems = new OrderedMap();
    this.gameState = state;
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
    this.systems = this.systems.set(id, system);

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
      this.systems = this.systems.delete(id);
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
    this.isRunning = true;
    return new Promise((resolve, reject) => {
      const tick = () => {
        try {
          // Update and render cycles.
          const itr = this.systems.values();
          let currentPosition = itr.next();
          while (!currentPosition.done) {
            currentPosition.value.update();
            currentPosition = itr.next();
          }
        } catch (e) {
          reject(e);
        }

        if (this.isRunning) {
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
    this.isRunning = false;
  }
}
