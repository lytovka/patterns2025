import { AbstractStorage } from "./storage.js";

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

class IndexedDbStorage extends AbstractStorage {
  constructor(connection, options) {
    super(connection, options);
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

    // TODO: needs to be model-agnostic
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("user")) {
        console.log("upgrade", options);
        db.createObjectStore("user", { keyPath, autoIncrement });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    return promise;
  }

  async insert(storeName, id, record) {
    const { promise, resolve, reject } = withResolvers();
    const idInt = parseInt(id);
    const tx = this.connection.transaction(
      storeName,
      TRANSACTION_MODES.READWRITE,
    );
    const store = tx.objectStore(storeName);
    idInt ? store.add(record, idInt) : store.add(record);
    tx.oncomplete = () => {
      this.#emit("log", { action: "insert", data: record });
      resolve(record);
    };
    tx.onerror = () => {
      const error = new Error("Could not add record");
      this.#emit("log", { action: "insert", data: error.message });
      reject(error);
    };

    return promise;
  }

  async readAll(storeName) {
    const { promise, resolve, reject } = withResolvers();
    const tx = this.connection.transaction(
      storeName,
      TRANSACTION_MODES.READONLY,
    );
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => {
      this.#emit("log", { action: "readAll", data: req.result });
      resolve(req.result);
    };
    req.onerror = () => {
      const error = new Error("Could not read record");
      this.#emit("log", { action: "readAll", data: error.message });
      reject(error);
    };

    return promise;
  }

  async read(storeName, id) {
    const { promise, resolve, reject } = withResolvers();
    const idInt = parseInt(id);
    const tx = this.connection.transaction(
      storeName,
      TRANSACTION_MODES.READONLY,
    );
    const store = tx.objectStore(storeName);
    const req = store.get(idInt);

    req.onsuccess = () => {
      const user = req.result;
      console.log(req);
      if (!user) {
        const error = new Error(`User with id=${id} not found`);
        this.#emit("log", { action: "readSingle", data: error.message });
        reject(error);
        return;
      }
      this.#emit("log", { action: "readSingle", data: user });
      resolve(user);
    };
    req.onerror = () => {
      const error = new Error("Update failed");
      this.#emit("log", { action: "readSingle", data: error.message });
      reject(error);
    };

    return promise;
  }

  async update(storeName, id, content) {
    const idInt = parseInt(id);
    const { promise, resolve, reject } = withResolvers();
    const tx = this.connection.transaction(
      storeName,
      TRANSACTION_MODES.READWRITE,
    );
    const store = tx.objectStore(storeName);
    const req = this.options.keyPath
      ? store.put(content)
      : store.put(content, idInt);

    req.onsuccess = (event) => {
      console.log("update", event);
      this.#emit("log", { action: "update", data: content });
      resolve(content);
    };
    req.onerror = () => {
      const error = new Error("Update failed");
      this.#emit("log", { action: "update", data: error.message });
      reject(error);
    };
    return promise;
  }

  async delete(storeName, id) {
    const idInt = parseInt(id);
    const { promise, resolve, reject } = withResolvers();
    return await this.read(storeName, idInt).then((record) => {
      const tx = this.connection.transaction(
        storeName,
        TRANSACTION_MODES.READWRITE,
      );
      tx.objectStore(storeName).delete(record.id);

      tx.oncomplete = () => {
        this.#emit("log", { action: "delete", data: record });
        resolve(record);
      };
      tx.onerror = () => {
        const error = new Error("Delete failed");
        this.#emit("log", { action: "delete", data: error.message });
        resolve(error);
      };

      return promise;
    }, reject);
  }

  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export default IndexedDbStorage;
