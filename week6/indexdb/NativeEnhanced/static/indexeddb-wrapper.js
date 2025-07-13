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
      this.#emit("log", { action: 'insert', data: record })
      resolve(record)
    };
    tx.onerror = () => {
      const error = new Error('Could not add record')
      this.#emit("log", { action: 'insert', data: error.message })
      reject(error)
    };

    return promise;
  }

  async readAll(storeName) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READONLY);
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => {
      this.#emit("log", { action: "readAll", data: req.result })
      resolve(req.result)
    };
    req.onerror = () => {
      const error = new Error('Could not read record')
      this.#emit("log", { action: "readAll", data: error.message })
      reject(error)
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
        const error = new Error(`User with id=${id} not found`)
        this.#emit("log", { action: "readSingle", data: error.message })
        reject(error)
        return;
      }
      this.#emit("log", { action: "readSingle", data: user })
      resolve(user)
    };
    req.onerror = () => {
      const error = new Error('Update failed')
      this.#emit("log", { action: "readSingle", data: error.message })
      reject(error)
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
        this.#emit("log", { action: "read", data: result })
        resolve(result)
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
      const error = new Error('Adult query failed')
      this.#emit("log", { action: "read", data: error.message })
      reject(error)
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
        const error = new Error(`User with id=${id} not found`)
        this.#emit("log", { action: "update", data: error.message })
        reject(error)
        return;
      }
      user.age += 1;
      store.put(user);
      tx.oncomplete = () => {
        this.#emit("log", { action: "update", data: user })
        resolve(user)
      };
    };
    req.onerror = () => {
      const error = new Error('Update failed')
      this.#emit("log", { action: "update", data: error.message })
      reject(error)
    };
    return promise;
  }

  async delete(storeName, id) {
    const { promise, resolve, reject } = withResolvers();
    return await this.readSingle(storeName, id).then((record) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE);
      tx.objectStore(storeName).delete(record.id);

      tx.oncomplete = () => {
        this.#emit("log", { action: "delete", data: record })
        resolve(record)
      };
      tx.onerror = () => {
        const error = new Error("Delete failed")
        this.#emit("log", { action: "delete", data: error.message })
        resolve(error)
      };

      return promise;
    }, reject)
  }

  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export default IndexedDbWrapper
