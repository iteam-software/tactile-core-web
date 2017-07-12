
import {Updater} from './updater';

it('should throw if reducer is called directly', () => {
  const updater = new Updater();
  expect(() => updater.reducer()).toThrowError('Not implemented');
});

it('should throw if update is called directly', () => {
  const updater = new Updater();
  expect(() => updater.update()).toThrowError('Not implemented');
});
