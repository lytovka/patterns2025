import {
  DatabaseTransactionManager,
  DatabaseConnection,
  DatabaseConfiguration,
} from './db.js';

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

// Usage
const logger = new Logger('output');

const schemas = {
  user: {
    id: { type: 'int', primary: true },
    name: { type: 'str', index: true },
    age: { type: 'int' },
  },
};
const dbConfig = new DatabaseConfiguration('BalancedDb', {
  version: 1,
  schemas,
});
const connection = await new DatabaseConnection(dbConfig).open();
const manager = new DatabaseTransactionManager(connection);

const transactionManager = {
  user: {
    getAll: () => manager.getAll('user'),
    get: (id) => manager.get('user', id),
    insert: (record) => manager.insert('user', record),
    update: (record) => manager.update('user', record),
    delete: (id) => manager.delete('user', id),
  },
};

document.getElementById('add').onclick = async () => {
  const name = prompt('Enter user name:');
  if (!name) return;
  const age = parseInt(prompt('Enter age:'), 10);
  if (!Number.isInteger(age)) return;
  const result = await transactionManager.user.insert({ name, age });
  console.log(result);
};

document.getElementById('get').onclick = async () => {
  const result = await transactionManager.user.getAll();
  console.log(result);
};

document.getElementById('update').onclick = async () => {
  const id = parseInt(prompt('Enter ID'), 10);
  if (!Number.isInteger(id)) return;
  const user = await transactionManager.user.get(id);
  const result = await transactionManager.user.update({
    ...user,
    age: user.age + 1,
  });
  console.log(result);
};

document.getElementById('delete').onclick = async () => {
  const id = parseInt(prompt('Enter ID'), 10);
  if (!Number.isInteger(id)) return;
  const result = await transactionManager.user.delete(id);
  console.log(result);
};

document.getElementById('adults').onclick = async () => {};
