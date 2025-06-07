"use strict";

const poolify = (factory, options, size, max) => {
  const instances = new Array(max).fill(factory(...options), 0, size);

  const acquire = () => {
    const index = instances.findIndex(Boolean);
    if (index === -1) throw new Error("Cannot acquire instance in emtpy pool");
    const freeInstance = instances[index];
    instances[index] = null;
    return freeInstance;
  };

  const push = (instance) => {
    const index = instances.findIndex((instance) => !Boolean(instance));
    if (index === -1) throw new Error("Cannot push instance to the full pool");
    instances[index] = instance;
  };

  return { acquire, push };
};

// Usage
const maxSize = 15;
const minSize = 10;

const createBuffer = (size) => new Uint8Array(size);
const pool = poolify(createBuffer, [4096], minSize, maxSize);

for (let i = 0; i < minSize; i++) {
  const instance = pool.acquire();
  console.log({ instance });
}

for (let i = 0; i < maxSize; i++) {
  pool.push(createBuffer);
}
