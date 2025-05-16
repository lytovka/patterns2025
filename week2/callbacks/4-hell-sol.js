"use strict";

// Task: refactor callback hell code with named callbacks
// Restriction: you can change code only in "Usage" section

const getPurchase = (callback) =>
  callback({
    Electronics: [
      { name: "Laptop", price: 1500 },
      { name: "Keyboard", price: 100 },
      { name: "HDMI cable", price: 10 },
    ],
    Textile: [{ name: "Bag", price: 50 }],
  });

const iterateGroups = (order, callback) => {
  for (const groupName in order) {
    const group = order[groupName];
    callback(group);
  }
};

const groupTotal = (items, callback) => {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  callback(total);
};

const budget = (limit) => {
  let balance = limit;

  const withdraw = (value, callback) => {
    const success = balance >= value;
    if (success) balance -= value;
    callback(success);
  };

  const rest = (callback) => callback(balance);

  return { withdraw, rest };
};

// Usage

const wallet = budget(1650);

const checkSuccess = (error, res) => {
  if (error) return void console.error(error);
  console.log(res);
};

const processWalletRest = (wallet) => {
  wallet.rest((balance) => {
    console.log({ success, amount, subtotal, balance });
  });
};

const processIterateGroups = (groups, callback) => {
  iterateGroups(groups, callback);
};

const processGroups = (amount, purchase) => {
  iterateGroups(purchase, (group) => {
    groupTotal(group, (subtotal) => {
      wallet.withdraw(subtotal, (success) => {
        if (success) amount += subtotal;
        wallet.rest((balance) => {
          console.log({ success, amount, subtotal, balance });
        });
      });
    });
  });
};

const processPurchase = (purchase) => {
  let amount = 0;
  processGroups(amount, purchase);
};

getPurchase(processPurchase);
