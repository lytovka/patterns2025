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

  constructor(name, version, options = {}) {
    this.#logger = options.logger || new Logger("output")
    this.#initDB(name, version).then((db) => { this.#db = db })
  }

  #initDB(name, version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
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
      const tx = this.#db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).add(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(new Error("Could not add record"));
    })
  }

  readAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(new Error("Could not read record"))
    })
  }

  // example: {age: {greater: 18}}
  read(storeName, condition = {}) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readonly');
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
      console.log("updating")
      const tx = this.#db.transaction(storeName, 'readwrite');
      console.log(tx)
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        const user = req.result;
        console.log(user)
        if (!user) {
          reject(new Error(`User with id=${id} not found`));
          return;
        }
        user.age += 1;
        store.put(user);
        console.log("heh")
        tx.oncomplete = () => resolve('Updated ' + JSON.stringify(user));
      };
      req.onerror = () => {
        console.log("heh???")
        reject(new Error('Update failed'));
      }
    })
  }

  delete(storeName, id) {
    return Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve(`Deleted user with id=${id}`);
      tx.onerror = () => reject(new Error('Delete failed'));
    })
  }
}


// Usage
const iDB = new IndexedDb("Example", 1)

document.getElementById('add').onclick = () => {
  const name = prompt('Enter user name:');
  if (!name) return;
  const age = parseInt(prompt('Enter age:'), 10);
  if (!Number.isInteger(age)) return;
  iDB.insert("user", { name, age }).then((result) => logger.log("aaaa", result)).catch((error) => logger.log("Error", error))
};

document.getElementById('get').onclick = () => {
  iDB.readAll("user").then((result) => logger.log("all records:", result)).catch((error) => logger.log("Error", error))
};

document.getElementById('update').onclick = () => {
  const id = parseInt(prompt("Enter ID"), 10)
  if (!Number.isInteger(id)) return
  iDB.update("user", id).then((result) => logger.log(result)).catch((error) => logger.log("Error Here", error))
};

document.getElementById('delete').onclick = () => {
  const id = parseInt(prompt("Enter ID"), 10)
  if (!Number.isInteger(id)) return
  iDB.delete("user", id).then((result) => logger.log("all records:", result)).catch((error) => logger.log("Error", error))
};

document.getElementById('adults').onclick = () => {
  iDB.read("user", { age: { greater: 18 } }).then((result) => logger.log("all records:", result)).catch((error) => logger.log("Error", error))
};
