"use strict";

// Task: change `iterate` contract from callbacks to Thenable

const iterate = (item) => ({
  then: function (onFulfilled) {
    onFulfilled(item);
  },
});

const electronics = [
  { name: "Laptop", price: 1500 },
  { name: "Keyboard", price: 100 },
  { name: "HDMI cable", price: 10 },
];

// Use await syntax to get items
(async () => {
  for (const item of electronics) {
    const awaitedItem = await iterate(item);
    console.log(awaitedItem);
  }
})();
