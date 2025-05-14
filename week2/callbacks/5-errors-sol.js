'use strict';

// Task: rewrite error handling to use callback-last-error-first
// contract to return errors instead of throwing them.
// So remove all try/catch blocks and pass errors to callbacks.
// Hint: You may also use error.cause to wrap escalated errors.
// Extra credit task: use AggregateError to combine escalated errors.
// Extra credit task: fix eslint error: "Function declared in a loop
//   contains unsafe references to variable(s) 'total'  no-loop-func"

const MAX_PURCHASE = 2000;

const calculateSubtotal = (goods, callback) => {
  let amount = 0;
  for (const item of goods) {
    if (typeof item.name !== 'string') {
      callback(new Error('Noname in item in the bill'), null);
      return
    }
    if (typeof item.price !== 'number') {
      callback(new Error(`${item.name} price expected to be number`), null);
      return
    }
    if (item.price < 0) {
      callback(new Error(`Negative price for ${item.name}`), null);
      return
    }
    amount += item.price;
  }
  callback(null, amount);
};

const calculateTotal = (order, callback) => {
  const expenses = new Map();
  let total = 0;
  const calc = (groupName) => (error, amount) => {
    if (error) return void callback(error, null)
    total += amount;
    expenses.set(groupName, amount);
  };
  for (const groupName in order) {
    const goods = order[groupName];
    calculateSubtotal(goods, calc(groupName));
    if (total > MAX_PURCHASE) {
      return void callback(new Error('Total is above the limit'), null);
    }
  }
  callback(null, { total, expenses });
};

const purchase = {
  Electronics: [
    { name: 'Laptop', price: 1500 },
    { name: 'Keyboard', price: 100 },
    { name: 'HDMI cable' },
  ],
  Textile: [
    { name: 'Bag', price: 50 },
    { price: 20 },
  ],
};

console.log(purchase);
calculateTotal(purchase, (error, bill) => {
  console.count("ivan")
  if (error) {
    console.log('Error detected');
    return void console.error(error);
  }
  console.log(bill);
});
