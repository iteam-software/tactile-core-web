
import {System} from './system';
import {Map} from 'immutable';

const position = {x: 1, y: 1};
const component = {abc: {position}};
// eslint-disable-next-line
class TestSystem extends System {
// eslint-disable-next-line
  makeComponent(init) {
    return {...init};
  }
}

it('should return the original state for an unhandled action', () => {
  const system = new System();
  const state = system.componentsReducer({hello: 'world!'}, {type: 'None'});
  expect(state).toEqual({hello: 'world!'});
});

it('should update the position of a component', () => {
  const system = new System();
  const components = new Map(component);
  const action = {type: 'Entity/Position', position: {x: 2, y: 2}, id: 'abc'};
  const state = system.componentsReducer(components, action);
  expect(state.get('abc')).toEqual({position: {x: 2, y: 2}});
});

it('should not update the position of a component it does not own', () => {
  const system = new System();
  const components = new Map(component);
  const action = {type: 'Entity/Position', position, id: 'cdf'};
  const state = system.componentsReducer(components, action);
  expect(state).toEqual(new Map(component));
});

it('should create a component when an entity asks for one', () => {
  const system = new TestSystem();
  const init = {id: 'abc', position};
  const action = {
    type: 'Entity/Create',
    systems: [system.getSystemId()],
    ...init};
  const state = system.componentsReducer(new Map(), action);
  expect(state).toEqual(new Map({abc: {position}}));
});

it('should not create a component if the system is not present', () => {
  const system = new TestSystem();
  const init = {id: 'abc', position};
  const action = {
    type: 'Entity/Create',
    systems: [],
    ...init,
  };
  const state = system.componentsReducer(new Map(), action);
  expect(state).toEqual(new Map());
});

it('should remove a component if the parent entity is destroyed', () => {
  const system = new TestSystem();
  const components = new Map({abc: {position}});
  const action = {
    type: 'Entity/Destroy',
    systems: [system.getSystemId()],
    id: 'abc',
  };
  const state = system.componentsReducer(components, action);
  expect(state).toEqual(new Map());
});

it('should remove a component if the entity asks for it', () => {
  const system = new TestSystem();
  const components = new Map({abc: {position}});
  const action = {
    type: 'Entity/Remove',
    systems: [system.getSystemId()],
    id: 'abc',
  };
  const state = system.componentsReducer(components, action);
  expect(state).toEqual(new Map());
});

it('should not remoev a component the system being in the list', () => {
  const system = new TestSystem();
  const components = new Map({abc: {position}});
  const action = {
    type: 'Entity/Remove',
    systems: [],
    id: 'abc',
  };
  const state = system.componentsReducer(components, action);
  expect(state).toEqual(new Map({abc: {position}}));
});

it('should throw if makeComponent is directly called', () => {
  const system = new System();
  expect(() => system.makeComponent()).toThrowError('Not implemented');
});
