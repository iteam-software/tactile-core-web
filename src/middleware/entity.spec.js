
import {entityMiddleware} from './entity';

it('should call next if the action is not SpawnEntity type', (done) => {
  const action = {type: 'NotSpawnEntity', a: 'b'};
  const next = jest.fn((action) => {
    expect(action).toEqual(action);
    done();
  });
  entityMiddleware({})(next)(action);
  expect(next).toHaveBeenCalled();
});

it('should dispatch an Entity/Create when it handles spawn', (done) => {
  const store = {dispatch: jest.fn((action) => action)};
  const next = jest.fn((action) => {
    expect(action.id).toBeTruthy();
    expect(action.systems).toEqual(['TestSystem']);
    expect(action.type).toBe('Entity/Create');
    done();
  });
  const action = {type: 'SpawnEntity', systems: ['TestSystem']};
  entityMiddleware(store)(next)(action);
  expect(store.dispatch).toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
});
