"use strict";

class Poolify {
  constructor(factory, options, size, max) {
    this.instances = new Array(max).fill(factory(...options), 0, size);
  }

  acquire() {
    const index = this.instances.findIndex(Boolean);
    if (index === -1) throw new Error("Cannot acquire instance in emtpy pool");
    const freeInstance = this.instances[index];
    this.instances[index] = null;
    return freeInstance;
  }

  push(instance) {
    const index = this.instances.findIndex((instance) => !Boolean(instance));
    if (index === -1) throw new Error("Cannot push instance to the full pool");
    this.instances[index] = instance;
  }
}

// Usage
const maxSize = 15;
const minSize = 10;

const createBuffer = (size) => new Uint8Array(size);
const pool = new Poolify(createBuffer, [4096], minSize, maxSize);

for (let i = 0; i < minSize; i++) {
  const instance = pool.acquire();
  console.log({ instance });
}

for (let i = 0; i < maxSize; i++) {
  pool.push(createBuffer);
}
