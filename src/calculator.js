/**
 * Simple calculator module.
 */

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('division by zero');
  }
  return a / b;
}

function power(base, exp) {
  if (exp < 0) {
    throw new Error('negative exponent not supported');
  }
  return base ** exp;
}

module.exports = { add, subtract, divide, power };
