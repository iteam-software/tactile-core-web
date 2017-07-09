
import {Engine} from './engine';
import {System} from './system';

// eslint-disable-next-line
class TestSystem extends System {
  /**
   * Construct a test system.
   */
  constructor() {
    super();
    this.runCount = 0;
  }
  /**
   * Handle test updating
   * @param {object} delta The frame delta.
   */
  update(delta) {
    ++this.runCount;
  }
}

// eslint-disable-next-line
class ThrowingSystem extends System {
  // eslint-disable-next-line  
  update(delta) {
    throw new Error('This system throws!');
  }
}

it('should be constructable', () => {
  expect(new Engine()).not.toBeNull();
});

it('should add a system', () => {
  const engine = new Engine();
  const system = new TestSystem();
  const id = engine.addSystem(system);
  expect(id).toBe(engine.getSystemId(system));
  expect(engine.systems.size).toBe(1);
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
  const id = engine.addSystem(new TestSystem());
  engine.removeSystem(id);
  expect(engine.systems.size).toBe(0);
});

it('should remove a system given a system', () => {
  const engine = new Engine();
  const system = new TestSystem();
  engine.addSystem(system);

  // Pre act assertion
  expect(engine.systems.size).toBe(1);

  // Act
  engine.removeSystem(system);
  expect(engine.systems.size).toBe(0);
});

it('should start and stop', () => {
  jest.useFakeTimers();

  const engine = new Engine();
  const system = new TestSystem();
  engine.addSystem(system);

  const promise = engine.run().then(() => {
    expect(system.runCount).toBe(2);
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

  const promise = engine.run();
  engine.stop();

  jest.runOnlyPendingTimers();

  return expect(promise).rejects.toBeTruthy();
});
