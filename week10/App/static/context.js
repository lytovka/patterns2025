class StorageContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  insert(container, key, value) {
    return this.strategy.insert(container, key, value);
  }
  read(container, key) {
    return this.strategy.read(container, key);
  }
  update(container, key, value) {
    return this.strategy.update(container, key, value);
  }
  delete(container, key) {
    return this.strategy.delete(container, key);
  }
  readAll(container) {
    return this.strategy.readAll(container);
  }
}

export { StorageContext };
