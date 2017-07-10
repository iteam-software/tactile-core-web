import {Timer} from './timer';

beforeEach(() => {
  jest.mock('performance-now');
});

afterEach(() => {
  jest.resetAllMocks();
});

test('it should construct a new timer', () => {
  // Arrange && Act
  const timer = new Timer();

  // Assert
  expect(timer).not.toBeNull();
});

test('it should start timing properly', () => {
  // Arrange
  const timer = new Timer();
  timer.start();

  // Act
  timer.tick();

  // Assert
  expect(timer.getTime()).toBe(1);
});

test('it should provide a delta properly', () => {
  // Arrange
  const timer = new Timer();
  timer.start();

  // Act
  timer.tick();

  // Assert
  expect(timer.getDelta()).toBe(1);
});
