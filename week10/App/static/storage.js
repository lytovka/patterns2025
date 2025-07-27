class AbstractStorage extends EventTarget {
  constructor(connection, options = {}) {
    if (new.target === AbstractStorage) {
      throw new Error("Cannot instantiate abstract class StorageWrapper");
    }
    super();
    this.connection = connection;
    this.options = options;
  }

  async insert(store, content) {
    throw new Error("Abstract method 'insert' must be implemented by subclass");
  }

  async readAll(store) {
    throw new Error(
      "Abstract method 'readAll' must be implemented by subclass",
    );
  }

  async read(store, id) {
    throw new Error("Abstract method 'read' must be implemented by subclass");
  }

  async update(store, record) {
    throw new Error("Abstract method 'update' must be implemented by subclass");
  }

  async delete(store, id) {
    throw new Error("Abstract method 'update' must be implemented by subclass");
  }
}

export { AbstractStorage };
