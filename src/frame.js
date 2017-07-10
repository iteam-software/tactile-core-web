
const os = require('os');
const cluster = require('cluster');

/**
 * Handle an update tick
 * @param {Array} updaters The updaters
 * @param {number} delta The timer delta
 * @param {object} store The store
 */
export function update(updaters, delta, store) {
  for (let i = 0; i < updaters.length; ++i) {
    updaters[i](delta, store);
  }
  process.send(true);
}

/**
 * 
 * @param {Array} renderers The renderers
 * @param {object} state The current store snapshot.
 */
export function render(renderers, state) {
  for (let i = 0; i < renderers.length; ++i) {
    renderers[i](state);
  }
  process.send(true);
}

/**
 * 
 * @param {Array} updaters 
 * @param {Array} renderers 
 * @param {Timer} timer 
 * @param {object} store 
 */
export function frames(updaters, renderers, timer, store) {
  const multithreaded = os.cpus().length > 1;
  const delta = timer.getDelta();
  if (multithreaded) {
    if (cluster.isMaster) {
      // Spawn the workers
      const updater = cluster.fork();
      const renderer = cluster.fork();
      let renderComplete;
      let updateComplete;

      const tick = () => {
        renderComplete = updateComplete = false;
        renderer.send(1);
        updater.send(2);
      };

      const finalize = () => {
        if (renderComplete && updateComplete) {
          requestAnimationFrame(tick);
        }
      };

      const updaterHandler = (done) => {
        updateComplete = done;
        finalize();
      };

      const renderHandler = (done) => {
        renderComplete = done;
        finalize();
      };

      updater.on('message', updaterHandler);
      renderer.on('message', renderHandler);

      tick();
    } else {
      process.on('message', (action) => action === 1
        ? render(renderers, store.getState())
        : update(updaters, delta, store));
    }
  } else {
    const tick = () => {
      delta = timer.getDelta();
      try {
        // Update and render cycles.
        for (let i = 0; i < renderers.length; ++i) {
          renderers[i](store.getState());
        }
        for (let i = 0; index < updaters.length; ++i) {
          updaters[i](delta, store);
        }
      } catch (e) {
        reject(e);
      }

      if (isRunning) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };

    tick();
  }
}
