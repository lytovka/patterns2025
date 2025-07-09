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

  update(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
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
      req.onerror = () => reject(new Error('Update failed'));
    })
  }

  delete(storeName, id) {
    return Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve(`Deleted user with id=${id}`);
      tx.onerror = () => reject(new Error('Delete failed'));
    })
  }
}

const db = await new Promise((resolve, reject) => {
  const request = indexedDB.open('Example', 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains('user')) {
      db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const insert = (storeName, record) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).add(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(new Error("Could not add record"));
  })
}

//------
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
  iDB.update("user", id).then((result) => logger.log(result)).catch((error) => logger.log("Error", error))
};

document.getElementById('delete').onclick = () => {
  const id = parseInt(prompt("Enter ID"), 10)
  if (!Number.isInteger(id)) return
  iDB.delete("user", id).then((result) => logger.log("all records:", result)).catch((error) => logger.log("Error", error))
};

document.getElementById('adults').onclick = () => {
  const tx = db.transaction('user', 'readonly');
  const store = tx.objectStore('user');
  const req = store.openCursor();
  const adults = [];
  req.onsuccess = (event) => {
    const cursor = event.target.result;
    if (!cursor) {
      logger.log('Adults:', adults);
      return;
    }
    const user = cursor.value;
    if (user.age >= 18) adults.push(user);
    cursor.continue();
  };
  req.onerror = () => logger.log('Adult query failed');
};
