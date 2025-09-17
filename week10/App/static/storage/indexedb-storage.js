// polyfill
function withResolvers() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const TRANSACTION_MODES = {
  READONLY: "readonly",
  READWRITE: "readwrite",
  VERSIONCHANGE: "versionchange",
};

/**
 * @implements {AbstractStorage}
 */
class IndexedDbStorage {
  #connection;
  #options;

  constructor(connection, options) {
    this.#connection = connection;
    this.#options = options;
  }

  static async build(options = {}) {
    const { name, version } = options;
    if (!name) throw new Error("'options.name' must be provided");
    if (!version) throw new Error("'options.version' must be provided");
    const connection = await this.#initDB(options);
    return new IndexedDbStorage(connection, options);
  }

  static async #initDB(options) {
    const {
      name,
      version,
      keyPath = undefined,
      autoIncrement = true,
    } = options;
    const { promise, resolve, reject } = withResolvers();
    const request = window.indexedDB.open(name, version);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("user")) {
        db.createObjectStore("user", { keyPath, autoIncrement });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    return promise;
  }

  async insert(storeName, id, record) {
    const { keyPath } = this.#options;
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#connection.transaction(
      storeName,
      TRANSACTION_MODES.READWRITE,
    );
    const store = tx.objectStore(storeName);
    keyPath ? store.add(record) : store.add(record, parseInt(id));
    tx.oncomplete = () => {
      resolve(record);
    };
    tx.onerror = () => {
      const error = new Error("Could not add record");
      reject(error);
    };

    return promise;
  }

  async readAll(storeName) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#connection.transaction(
      storeName,
      TRANSACTION_MODES.READONLY,
    );
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => {
      resolve(req.result);
    };
    req.onerror = () => {
      const error = new Error("Could not read record");
      reject(error);
    };

    return promise;
  }

  async read(storeName, id) {
    const { promise, resolve, reject } = withResolvers();
    const idInt = parseInt(id);
    const tx = this.#connection.transaction(
      storeName,
      TRANSACTION_MODES.READONLY,
    );
    const store = tx.objectStore(storeName);
    const req = store.get(idInt);

    req.onsuccess = () => {
      const user = req.result;
      if (!user) {
        const error = new Error(`User with id=${id} not found`);
        reject(error);
        return;
      }
      resolve(user);
    };
    req.onerror = () => {
      const error = new Error("Update failed");
      reject(error);
    };

    return promise;
  }

  async update(storeName, id, content) {
    const idInt = parseInt(id);
    const { promise, resolve, reject } = withResolvers();
    const tx = this.#connection.transaction(
      storeName,
      TRANSACTION_MODES.READWRITE,
    );
    const store = tx.objectStore(storeName);
    const req = this.#options.keyPath
      ? store.put(content)
      : store.put(content, idInt);

    req.onsuccess = () => {
      resolve(content);
    };
    req.onerror = () => {
      const error = new Error("Update failed");
      reject(error);
    };
    return promise;
  }

  async delete(storeName, id) {
    const idInt = parseInt(id);
    const { promise, resolve, reject } = withResolvers();
    return await this.read(storeName, idInt).then((record) => {
      const tx = this.#connection.transaction(
        storeName,
        TRANSACTION_MODES.READWRITE,
      );
      tx.objectStore(storeName).delete(record.id);

      tx.oncomplete = () => {
        resolve(record);
      };
      tx.onerror = () => {
        const error = new Error("Delete failed");
        resolve(error);
      };

      return promise;
    }, reject);
  }
}

export default IndexedDbStorage;
