
import {Engine} from './engine';
import {Updater} from './updater';
import {Renderer} from './renderer';

// eslint-disable-next-line
class TestUpdater extends Updater {
  // eslint-disable-next-line
  constructor() {
    super();
    this.runCount = 0;
    this.expectedState = false;
  }
  /**
   * Handle test updating
   * @param {object} delta The frame delta.
   * @param {object} store The game store.
   */
  update(delta, store) {
    store.dispatch({
      type: 'Hello/World!',
    });
    ++this.runCount;
    this.expectedState =
      typeof store.components !== 'undefined' &&
      typeof store.internal !== 'undefined' &&
      typeof store.internal.count !== 'undefined' &&
      typeof store.engine === 'undefined';
  }

  // eslint-disable-next-line  
  reducer(state = {}, action) {
    if (action.type === 'Hello/World!') {
      return {count: this.runCount};
    }
    return state;
  }
  // eslint-disable-next-line  
  makeComponent(init) {
    return {hello: 'World!'};
  }
}

// eslint-disable-next-line  
class RenderSystem extends Renderer {
  // eslint-disable-next-line  
  draw(delta, state) {}
}

// eslint-disable-next-line
class ThrowingSystem extends Updater {
  // eslint-disable-next-line  
  update(delta) {
    throw new Error('This system throws!');
  }
  // eslint-disable-next-line
  reducer(state = {}, action) {
    return state;
  }
}

it('should be constructable', () => {
  expect(new Engine()).not.toBeNull();
});

it('should add an updater', () => {
  const engine = new Engine();
  const system = new TestUpdater();
  const id = engine.addSystem(system);
  expect(id).toBe(Engine.getSystemId(system));
  expect(engine._systems.size).toBe(1);
});

it('should add a renderer', () => {
  const engine = new Engine();
  const renderer = new RenderSystem();
  const id = engine.addSystem(renderer);
  expect(id).toBe(Engine.getSystemId(renderer));
  expect(engine._systems.size).toBe(1);
});

it('should throw when you try to add a null system', () => {
  const engine = new Engine();
  expect(() => engine.addSystem()).toThrow();
});

it('should throw when you try to add an invalid system', () => {
  const engine = new Engine();
  expect(() => engine.addSystem({})).toThrow();
});

it('should remove a system given a system id', () => {
  const engine = new Engine();
  const id = engine.addSystem(new TestUpdater());
  engine.removeSystem(id);
  expect(engine._systems.size).toBe(0);
});

it('should remove a system given a system', () => {
  const engine = new Engine();
  const system = new TestUpdater();
  engine.addSystem(system);

  // Pre act assertion
  expect(engine._systems.size).toBe(1);

  // Act
  engine.removeSystem(system);
  expect(engine._systems.size).toBe(0);
});

it('should remove a renderer given a renderer', () => {
  const engine = new Engine();
  const renderer = new RenderSystem();
  engine.addSystem(renderer);

  // Pre act assertion
  expect(engine._systems.size).toBe(1);

  // Act
  engine.removeSystem(renderer);
  expect(engine._systems.size).toBe(0);
});

it('should allow removeSystem to be called idempotently', () => {
  const engine = new Engine();
  // Calling removeSystem with an unexpected type should not throw.
  expect(() => engine.removeSystem(false)).not.toThrow();
});

it('should start and stop and slice the store per system', () => {
  jest.useFakeTimers();

  const engine = new Engine();
  const system = new TestUpdater();
  const renderer = new RenderSystem();
  engine.addSystem(system);
  engine.addSystem(renderer);

  const promise = engine.start().then(() => {
    expect(system.runCount).toBe(2);
    expect(system.expectedState).toBe(true);
    return true;
  });
  engine.stop();

  jest.runOnlyPendingTimers();

  return expect(promise).resolves.toBeTruthy();
});

it('should reject when a system throws', () => {
  jest.useFakeTimers();

  const engine = new Engine();
  const system = new ThrowingSystem();
  engine.addSystem(system);

  const promise = engine.start();
  engine.stop();

  jest.runOnlyPendingTimers();

  return expect(promise).rejects.toBeTruthy();
});

it('should perform reasonably well', () => {
  jest.useFakeTimers();
  const engine = new Engine();
  const system = new TestUpdater();
  engine.addSystem(system);

  return expect(new Promise((resolve, reject) => {
    engine.start()
      .then(() => resolve(system.runCount))
      .catch((err) => reject(err));

    setTimeout(() => engine.stop(), 2000);

    jest.runAllTimers();
  })).resolves.toBeGreaterThan(120 * .95);
});
