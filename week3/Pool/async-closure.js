"use strict";

class PoolError extends Error {
  name = "PoolError";
  constructor(message) {
    super(message);
  }
}

const DEFAULT_POOL_MAX_SIZE = 15;

const poolify = (options = {}) => {
  let maxSize = options.max || DEFAULT_POOL_MAX_SIZE;
  let currentIndex = 0;
  const instances = new Array(maxSize);
  const freeInstances = new Array(maxSize).fill(false);
  const queue = [];
  let availableInstances = 0;

  const add = (instance) => {
    if (availableInstances === maxSize) {
      throw new PoolError("attempt to add instance to the full pool");
    }
    if (instances.includes(instance)) {
      throw new PoolError("attempt to add duplicate instance");
    }
    instances[currentIndex] = instance;
    freeInstances[currentIndex] = true;
    availableInstances++;
    currentIndex++;
  };

  const addAll = (...instances) => {
    if (availableInstances === maxSize) {
      throw new PoolError("attempt to add instance to the full pool");
    }
    if (instances.length > maxSize) {
      throw new PoolError("attempt to exceed the size of the pool");
    }
    instances.forEach((instance) => {
      add(instance);
    });
  };

  const acquire = (callback) => {
    if (availableInstances === 0) {
      queue.push(callback);
      return;
    }
    let currInstance = null;
    let isFree = false;
    while (!currInstance || !isFree) {
      currInstance = instances[currentIndex];
      isFree = freeInstances[currentIndex];
      currentIndex++;
      if (currentIndex > maxSize - 1) currentIndex = 0;
    }
    return currInstance;
  };

  const capture = (callback) => {
    const instance = acquire(callback);
    if (!instance)
      return callback(new PoolError("no free instances found"), null);
    const index = instances.indexOf(instance);
    freeInstances[index] = false;
    availableInstances--;
    return callback(null, instance);
  };

  const release = (instance, callback) => {
    const index = instances.indexOf(instance);
    if (index === -1)
      return callback(new PoolError("cannot release foreign instance", null));
    if (freeInstances[index])
      return callback(new PoolError("instance was not previously acquired."));
    availableInstances++;
    freeInstances[index] = true;
    if (queue.length > 0) {
      const nextCallback = queue.shift();
      if (nextCallback) {
        setImmediate(() => {
          freeInstances[index] = false;
          availableInstances--;
          nextCallback(null, instance);
        });
      }
    }
    return callback(null, instance);
  };

  return { acquire, add, addAll, capture, release };
};

// Usage
const main = () => {
  const max = 20;
  const pool = poolify({ max });
  const instance1 = { instance: 1 };
  const instance2 = { instance: 2 };
  const instance3 = { instance: 3 };

  pool.add(instance1);
  pool.addAll(instance2, instance3);
  // pool.add(instance1)

  /* for (let i = 4; i < max+1; i++) {
    const instance = { instance: i }
    pool.add(instance)
  } */

  const callback = (type) => (err, instance) => {
    if (err) return console.error(err);
    console.log(type, { instance });
  };

  pool.capture(callback("capture"));
  pool.capture(callback("capture"));
  pool.capture(callback("capture"));
  // pool.capture(callback("capture"));
  pool.release(instance2, callback("release"));
  pool.release(instance1, callback("release"));
  // pool.release(instance1, callback("release"));
};

main();
