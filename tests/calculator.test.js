const { add, subtract, divide, remainder } = require('../src/calculator');

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

describe('remainder', () => {
  it('returns remainder of division', () => {
    expect(remainder(10, 3)).toBe(1);
  });
  it('returns 0 when divisible', () => {
    expect(remainder(8, 4)).toBe(0);
  });
  it('throws on divisor zero', () => {
    expect(() => remainder(5, 0)).toThrow('division by zero');
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
