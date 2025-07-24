const TRANSACTION_MODES = {
  READONLY: 'readonly',
  READWRITE: 'readwrite',
  VERSIONCHANGE: 'versionchange',
};

class SchemaValidator {
  validate(record, schema) {
    for (const [key, val] of Object.entries(record)) {
      const field = schema[key];
      const name = `Field ${key}`;
      if (!field) throw new Error(`${name} is not defined`);
      if (field.type === 'int') {
        if (Number.isInteger(val)) continue;
        throw new Error(`${name} expected to be integer`);
      } else if (field.type === 'str') {
        if (typeof val === 'string') continue;
        throw new Error(`${name} expected to be string`);
      }
    }
  }
}

class DatabaseConfiguration {
  name;
  version;
  schemas;

  constructor(name, { version = 1, schemas = {} } = {}) {
    this.name = name;
    this.version = version;
    this.schemas = schemas;
  }
}

class DatabaseConnection {
  /**
   * @type {DatabaseConfiguration}
   */
  #dbConfig;

  /**
   * @type {boolean}
   */
  #active;

  /**
   * @type {IDBDatabase}
   */
  #instance;

  constructor(dbConfig) {
    this.#dbConfig = dbConfig;
    this.#active = false;
    this.#instance = null;
  }

  async open() {
    const { name, version } = this.#dbConfig;
    await new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onupgradeneeded = (event) => {
        this.#upgradeVersion(event.target.result);
      };
      request.onsuccess = (event) => {
        this.#instance = event.target.result;
        this.#active = true;
        resolve();
      };
      request.onerror = (event) => {
        let { error } = event.target;
        if (!error) error = new Error(`IndexedDB: can't open ${name}`);
        reject(error);
      };
    });
    return this;
  }

  close() {
    if (!this.#active) return;
    this.#instance.close();
    this.#instance = null;
    this.#active = false;
  }

  isActive() {
    return this.#active;
  }

  getTransaction(store, mode) {
    return this.#instance.transaction(store, mode);
  }

  getSchema(storeName) {
    return this.#dbConfig.schemas[storeName];
  }

  #upgradeVersion(db) {
    const { schemas } = this.#dbConfig;
    for (const [name, schema] of Object.entries(schemas)) {
      if (!db.objectStoreNames.contains(name)) {
        const options = { keyPath: 'id', autoIncrement: true };
        const store = db.createObjectStore(name, options);
        for (const [field, def] of Object.entries(schema)) {
          if (name !== 'id' && def.index) {
            store.createIndex(field, field, { unique: false });
          }
        }
      }
    }
  }
}

class DatabaseTransactionManager {
  /**
   * @type {DatabaseConnection}
   **/
  #connection;

  /**
   * @type {SchemaValidator}
   **/
  #validator;

  constructor(connection) {
    this.#connection = connection;
    this.#validator = new SchemaValidator();
  }

  get(store, id) {
    const op = (objectStore) => {
      const req = objectStore.get(id);
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error(`Can't get ${id}`));
      });
    };
    return this.#exec(store, op, TRANSACTION_MODES.READONLY);
  }

  getAll(store) {
    const op = (objectStore) => {
      const req = objectStore.getAll();
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    };
    return this.#exec(store, op, TRANSACTION_MODES.READONLY);
  }

  insert(store, record) {
    this.#validate({ store, record });
    return this.#exec(store, (objectStore) => objectStore.add(record));
  }

  update(store, record) {
    this.#validate({ store, record });
    return this.#exec(store, (objectStore) => objectStore.put(record));
  }

  delete(store, id) {
    return this.#exec(store, (objectStore) => objectStore.delete(id));
  }

  #exec(store, operation, mode = TRANSACTION_MODES.READWRITE) {
    return new Promise((resolve, reject) => {
      if (!this.#connection.isActive()) {
        return reject(new Error('Database not connected'));
      }
      try {
        const tx = this.#connection.getTransaction(store, mode);
        const objectStore = tx.objectStore(store);
        const result = operation(objectStore);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error('Transaction error'));
      } catch (error) {
        reject(error);
      }
    });
  }

  #validate({ store, record }) {
    const schema = this.#connection.getSchema(store);
    if (!schema) throw Error(`No schema found for store ${store}`);
    this.#validator.validate(record, schema);
  }
}

export {
  DatabaseConnection,
  DatabaseConfiguration,
  DatabaseTransactionManager,
};
