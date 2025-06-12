"use strict";

class PoolError extends Error {
  name = "PoolError";
  constructor(message) {
    super(message);
  }
}

const DEFAULT_POOL_MAX_SIZE = 15;

class Poolify {
  instances = [];
  freeInstances = [];
  queue = [];
  maxSize = 0;
  currentIndex = 0;
  availableInstances = 0;

  constructor(options = {}) {
    this.maxSize = options.max || DEFAULT_POOL_MAX_SIZE;
    this.instances = new Array(this.maxSize);
    this.freeInstances = new Array(this.maxSize).fill(false);
  }

  add(instance) {
    if (this.availableInstances === this.maxSize) {
      throw new PoolError("attempt to add instance to the full pool");
    }
    if (this.instances.includes(instance)) {
      throw new PoolError("attempt to add duplicate instance");
    }
    this.instances[this.currentIndex] = instance;
    this.freeInstances[this.currentIndex] = true;
    this.availableInstances++;
    this.currentIndex++;
  }

  addAll(...instances) {
    if (this.availableInstances === this.maxSize) {
      throw new PoolError("attempt to add instance to the full pool");
    }
    if (instances.length > this.maxSize) {
      throw new PoolError("attempt to exceed the size of the pool");
    }
    instances.forEach((instance) => {
      this.add(instance);
    });
  }

  async #acquire() {
    if (this.availableInstances === 0) {
      return new Promise((resolve) => {
        this.queue.push(resolve);
      });
    }
    let currInstance = null;
    let currIndex = this.currentIndex;
    let isFree = false;
    while (!currInstance || !isFree) {
      currIndex = this.currentIndex;
      currInstance = this.instances[currIndex];
      isFree = this.freeInstances[this.currentIndex];
      this.currentIndex++;
      if (this.currentIndex > this.maxSize - 1) this.currentIndex = 0;
    }
    return { currInstance, currIndex };
  }

  async capture() {
    const { currInstance, currIndex } = this.#acquire();
    if (!currInstance) throw new PoolError("no free instances found");
    this.freeInstances[currIndex] = false;
    this.availableInstances--;
    return currInstance;
  }

  release(instance) {
    const index = this.instances.indexOf(instance);
    if (index === -1) throw new PoolError("cannot release foreign instance");
    if (this.freeInstances[index])
      throw new PoolError("instance was not previously acquired.");
    this.availableInstances++;
    this.freeInstances[index] = true;
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      if (nextResolve) {
        setImmediate(() => {
          this.freeInstances[index] = false;
          this.availableInstances--;
          nextResolve(instance);
        });
      }
    }
    return instance;
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
