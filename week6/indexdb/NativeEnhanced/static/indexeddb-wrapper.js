// polyfill
function withResolvers() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const OPERATIONS = {
  greater: (a, b) => a > b,
  smaller: (a, b) => a < b,
};

const TRANSACTION_MODES = {
  READONLY: 'readonly',
  READWRITE: 'readwrite',
  VERSIONCHANGE: 'versionchange',
};

class IndexedDbWrapper extends EventTarget {
  #db;

  constructor(db) {
    super();
    this.#db = db;
  }

  static async build(name, version) {
    const db = await this.#initDB(name, version);
    return new IndexedDbWrapper(db);
  }

  static async #initDB(name, version) {
    const { promise, resolve, reject } = withResolvers();
    const request = window.indexedDB.open(name, version);

    // TODO: needs to be model-agnostic
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    return promise;
  }

  async insert(storeName, record) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE);

    tx.objectStore(storeName).add(record);
    tx.oncomplete = () => {
      this.#logAndFulfill('insert', record, resolve);
    };
    tx.onerror = () => {
      this.#logAndFulfill('insert', new Error('Could not add record'), reject);
    };

    return promise;
  }

  async readAll(storeName) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READONLY);
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => {
      this.#logAndFulfill('readAll', req.result, resolve);
    };
    req.onerror = () => {
      this.#logAndFulfill(
        'readAll',
        new Error('Could not read record'),
        reject,
      );
    };

    return promise;
  }

  // example: {age: {greater: 18}}
  async readSingle(storeName, id) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READONLY);
    const store = tx.objectStore(storeName);
    const req = store.get(id);

    req.onsuccess = () => {
      const user = req.result;
      if (!user) {
        this.#logAndFulfill(
          'readSingle',
          new Error(`User with id=${id} not found`),
          reject,
        );
        return;
      }
      this.#logAndFulfill('readSingle', user, resolve);
    };
    req.onerror = () => {
      this.#logAndFulfill('readSingle', new Error('Update failed'), reject);
    };

    return promise;
  }

  // example: {age: {greater: 18}}
  async read(storeName, condition = {}) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READONLY);
    const store = tx.objectStore(storeName);
    const req = store.openCursor();
    const result = [];

    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor) {
        this.#logAndFulfill('read', result, resolve);
        return;
      }
      const user = cursor.value;
      const [objKey, operation] = Object.entries(condition)[0];
      const [operationKey, value] = Object.entries(operation)[0];
      const op = OPERATIONS[operationKey] || null
      if (!op) {
        result.push(user)
      }
      else if (
        op(user[objKey], value) ||
        !condition ||
        !operation
      )
        result.push(user);

      cursor.continue();
    };
    req.onerror = () => {
      this.#logAndFulfill('read', new Error('Adult query failed'), reject);
    };

    return promise;
  }

  async update(storeName, id) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE);
    const store = tx.objectStore(storeName);
    const req = store.get(id);

    req.onsuccess = () => {
      const user = req.result;
      if (!user) {
        this.#logAndFulfill(
          'update',
          new Error(`User with id=${id} not found`),
          reject,
        );
        return;
      }
      user.age += 1;
      store.put(user);
      tx.oncomplete = () => {
        this.#logAndFulfill('update', user, resolve);
      };
    };
    req.onerror = () => {
      this.#logAndFulfill('update', new Error('Update failed'), reject);
    };
    return promise;
  }

  async delete(storeName, id) {
    const { promise, resolve, reject } = withResolvers();
    return await this.readSingle(storeName, id).then((record) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE);
      tx.objectStore(storeName).delete(record.id);

      tx.oncomplete = () => {
        this.#logAndFulfill('delete', record, resolve);
      };
      tx.onerror = () => {
        this.#logAndFulfill('delete', new Error('Delete failed'), reject);
      };

      return promise;
    }, reject)
  }

  // TODO: encapsulate emitting and resolve in different methods
  #logAndFulfill(type, value, resolver) {
    const v = value instanceof Error ? value.message : value;
    this.dispatchEvent(new CustomEvent('log', { detail: { type, value: v } }));
    resolver(value);
  }
}

export default IndexedDbWrapper
