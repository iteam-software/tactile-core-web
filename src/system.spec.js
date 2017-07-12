
import {System} from './system';
import {Map} from 'immutable';

it('should return the original state for an unhandled action', () => {
  const system = new System();
  const state = system.componentsReducer({hello: 'world!'}, {type: 'None'});
  expect(state).toEqual({hello: 'world!'});
});

it('should update the position of a component', () => {
  const system = new System();
  const components = new Map({abc: {position: {x: 1, y: 1}}});
  const action = {type: 'Entity/Position', position: {x: 2, y: 2}, id: 'abc'};
  const state = system.componentsReducer(components, action);
  expect(state.get('abc')).toEqual({position: {x: 2, y: 2}});
});
