"use strict";

class PoolError extends Error {
  name = "PoolError";
  constructor(message) {
    super(message);
  }
}

const DEFAULT_POOL_MAX_SIZE = 15;

class Poolify {
  #instances = [];
  #queue = [];
  #maxSize = 0;
  #currentIndex = 0;
  #availableInstances = 0;

  constructor(options = {}) {
    this.#maxSize = options.max || DEFAULT_POOL_MAX_SIZE;
    this.#instances = new Array(this.#maxSize).fill({ instance: null, isFree: false });
  }

  add(instance) {
    if (this.#availableInstances === this.#maxSize) {
      throw new PoolError("attempt to add instance to the full pool");
    }
    if (this.#instances.findIndex(i => i.instance === instance) !== -1) {
      throw new PoolError("attempt to add duplicate instance");
    }
    this.#instances[this.#currentIndex] = { instance, isFree: true };
    this.#availableInstances++;
    this.#currentIndex++;
  }

  addAll(...instances) {
    for (const instance of instances) this.add(instance)
  }

  #findFreeInstance(callback) {
    if (this.#availableInstances === 0) {
      this.#queue.push(callback);
      return { currInstance: null };
    }
    let currInstance = null;
    let currIndex = this.#currentIndex
    let isFree = false;
    while (!currInstance || !isFree) {
      // console.log({ currInstance, isFree, currIndex })
      currIndex = this.#currentIndex
      currInstance = this.#instances[this.#currentIndex].instance;
      isFree = this.#instances[this.#currentIndex].isFree;
      this.#currentIndex++;
      if (this.#currentIndex > this.#maxSize - 1) this.#currentIndex = 0;
    }
    return { currInstance, currIndex };
  }

  capture(callback) {
    const { currInstance, currIndex } = this.#findFreeInstance(callback);
    if (!currInstance)
      return callback(new PoolError("no free instances found"), null);
    this.#instances[currIndex].isFree = false;
    this.#availableInstances--;
    return callback(null, currInstance);
  }

  release(instance, callback) {
    const index = this.#instances.findIndex(i => i.instance === instance);
    if (index === undefined) {
      callback(new PoolError("cannot release foreign instance", null));
      return
    }
    if (this.#instances[index].isFree) {
      callback(new PoolError("instance was not previously acquired."));
      return
    }
    this.#availableInstances++;
    this.#instances[index].isFree = true;
    if (this.#queue.length > 0) {
      const nextCallback = this.#queue.shift();
      if (nextCallback) {
        setImmediate(() => {
          this.#instances[index].isFree = false;
          this.#availableInstances--;
          nextCallback(null, instance);
        });
      }
    }
    return callback(null, instance);
  }
}

// Usage
const main = () => {
  const max = 20;
  const pool = new Poolify({ max });
  const instance1 = { instance: 1 };
  const instance2 = { instance: 2 };
  const instance3 = { instance: 3 };

  pool.add(instance1);
  pool.addAll(instance2, instance3);
  // pool.add(instance1)
  //
  // for (let i = 4; i < max + 2; i++) {
  //   const instance = { instance: i }
  //   pool.add(instance)
  // }

  const callback = (type) => (err, instance) => {
    if (err) return console.error(err);
    console.log(type, { instance });
  };

  pool.capture(callback("capture"));
  pool.capture(callback("capture"));
  pool.capture(callback("capture"));
  // pool.capture(callback("capture"));
  // pool.capture(callback("capture"));
  pool.release(instance2, callback("release"));
  pool.release(instance1, callback("release"));
  // pool.release(instance1, callback("release"));
};

main();
