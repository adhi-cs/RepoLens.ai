const { add, subtract, divide } = require('../src/calculator');

describe('add', () => {
  it('adds positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('adds negative numbers', () => {
    expect(add(-1, -1)).toBe(-2);
  });
});

describe('subtract', () => {
  it('subtracts numbers', () => {
    expect(subtract(10, 3)).toBe(7);
  });
});

describe('divide', () => {
  it('divides normally', () => {
    expect(divide(10, 2)).toBe(5);
  });
  it('throws on division by zero', () => {
    expect(() => divide(1, 0)).toThrow('division by zero');
  });
});
