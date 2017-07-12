
import {Renderer} from './renderer';

it('should throw if draw is called directly', () => {
  const renderer = new Renderer();
  expect(() => renderer.draw()).toThrowError('Not implemented');
});
