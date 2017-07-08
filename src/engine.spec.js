
import {Engine} from './engine';
import {System} from './system';

// eslint-disable-next-line
class TestSystem extends System {}

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
