'use strict';

const DEFAULT_POOL_MAX_SIZE = 15

const poolify = (options = {}) => {
  let currentIndex = 0
  let maxSize = options.max || DEFAULT_POOL_MAX_SIZE
  const defaultInstance = options.factory ? options.factory(...options.factoryArgs) : undefined
  const instances = defaultInstance ? new Array(maxSize).fill(defaultInstance) : new Array(maxSize)
  const free = new Array(maxSize).fill(defaultInstance ? true : false)
  let available = defaultInstance ? maxSize : 0
  const queue = []

  const add = (instance) => {
    if (available === maxSize) {
      throw new Error("Pool: attempt to add instance to the full pool")
    }
    if (instances.includes(instance)) {
      throw new Error("Pool: attempt to add duplicate instance")
    }
    instances[currentIndex] = instance
    free[currentIndex] = true
    available++
    currentIndex++
  }

  const acquire = (callback) => {
    if (available === 0) {
      queue.push(callback)
      return
    }
    let currInstance = null
    let isFree = false
    while (!currInstance || !isFree) {
      currInstance = instances[currentIndex]
      isFree = free[currentIndex]
      currentIndex++
      if (currentIndex === maxSize - 1) currentIndex = 0
    }
    return currInstance
  }

  const capture = (callback) => {
    const instance = acquire(callback)
    if (!instance) return callback(new Error("Pool: no free instances found"), null)
    const index = instances.indexOf(instance)
    free[index] = false
    available--
    return callback(null, instance)
  }

  const release = (instance) => {
    const index = instances.indexOf(instance)
    if (index === -1) throw new Error("Pool: Cannot release foreign instance")
    if (free[index]) throw new Error("Pool: instance was not previously released.")
    available++
    free[index] = true
    if (queue.length > 0) {
      const nextCallback = queue.shift()
      if (nextCallback) {
        setImmediate(() => {
          free[index] = false
          available--
          nextCallback(null, instance)
        })
      }
    }
  }

  return { acquire, add, capture, release }
};

// Usage
const main = () => {
  const pool = poolify();
  const instance1 = { instance: 1 };
  pool.add(instance1);
  const instance2 = { instance: 2 };
  pool.add(instance2);
  const instance3 = { instance: 3 };
  pool.add(instance3);

  pool.capture((err, x1) => {
    if (err) return console.error(err);
    console.log({ x1 });

    pool.capture((err, x2) => {
      if (err) return console.error(err);
      console.log({ x2 });
      pool.capture((err, x3) => {
        if (err) return console.error(err);
        console.log({ x3 });
        pool.capture((err, x4) => {
          if (err) return console.error(err);
          console.log({ x4 });
        });
        pool.capture((err, x5) => {
          if (err) return console.error(err);
          console.log({ x5 });
        });
        pool.release(instance2);
        pool.release(instance1);
      });
    });
  });
};

main();
