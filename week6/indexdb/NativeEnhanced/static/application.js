class Logger {
  #output;

  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    this.#output.textContent += lines.join(' ') + '\n';
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

const logger = new Logger('output');

const OPERATIONS = {
  "greater": (a, b) => a > b,
  "smaller": (a, b) => a < b
}

const TRANSACTION_MODES = {
  READONLY: "readonly",
  READWRITE: "readwrite",
  VERSIONCHANGE: "versionchange"
}

class IndexedDb {
  #db
  #logger

  constructor(db, options) {
    this.#db = db
    this.#logger = options.logger || undefined
  }

  static async build(name, version, options = {}) {
    const db = await this.#initDB(name, version)
    return new IndexedDb(db, options)
  }

  static async #initDB(name, version) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  insert(storeName, record) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE);
      tx.objectStore(storeName).add(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(new Error("Could not add record"));
    })
  }

  readAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READONLY);
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(new Error("Could not read record"))
    })
  }

  // example: {age: {greater: 18}}
  read(storeName, condition = {}) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READONLY);
      const store = tx.objectStore(storeName);
      const req = store.openCursor();
      const result = [];
      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) {
          resolve(result)
          return
        }
        const user = cursor.value;
        const [objKey, operation] = Object.entries(condition)[0]
        const [operationKey, value] = Object.entries(operation)[0]
        if (OPERATIONS[operationKey](user[objKey], value) || !condition || !operation) result.push(user);
        cursor.continue();
      };
      req.onerror = () => reject(new Error('Adult query failed'));
    })
  }

  update(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE);
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        const user = req.result;
        if (!user) {
          reject(new Error(`User with id=${id} not found`));
          return;
        }
        user.age += 1;
        store.put(user);
        tx.oncomplete = () => resolve('Updated ' + JSON.stringify(user));
      };
      req.onerror = () => {
        reject(new Error('Update failed'));
      }
    })
  }

  delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, TRANSACTION_MODES.READWRITE)
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve(`Deleted user with id=${id}`);
      tx.onerror = () => reject(new Error('Delete failed'));
    })
  }
}

// Usage
const iDB = await IndexedDb.build("Example", 1, { logger: new Logger("output") })

document.getElementById('add').onclick = () => {
  const name = prompt('Enter user name:');
  if (!name) return;
  const age = parseInt(prompt('Enter age:'), 10);
  if (!Number.isInteger(age)) return;
  iDB.insert("user", { name, age })
    .then((result) => logger.log("aaaa", result))
    .catch((error) => logger.log("Error", error))
};

document.getElementById('get').onclick = () => {
  iDB.readAll("user")
    .then((result) => logger.log("all records:", result))
    .catch((error) => logger.log("Error", error))
};

document.getElementById('update').onclick = () => {
  const id = parseInt(prompt("Enter ID"), 10)
  if (!Number.isInteger(id)) return
  iDB.update("user", id)
    .then((result) => logger.log(result))
    .catch((error) => logger.log("Error Here", error))
};

document.getElementById('delete').onclick = () => {
  const id = parseInt(prompt("Enter ID"), 10)
  if (!Number.isInteger(id)) return
  iDB.delete("user", id)
    .then((result) => logger.log("all records:", result))
    .catch((error) => logger.log("Error", error))
};

document.getElementById('adults').onclick = () => {
  iDB.read("user", { age: { greater: 18 } })
    .then((result) => logger.log("all records:", result))
    .catch((error) => logger.log("Error", error))
};
