import IndexedDbWrapper from './indexeddb-wrapper.js';

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
const iDB = await IndexedDbWrapper.build('Example', 1);

iDB.addEventListener('log', (event) => {
  logger.log(event.detail);
});

document.getElementById('add').onclick = async () => {
  const name = prompt('Enter user name:');
  if (!name) return;
  const age = parseInt(prompt('Enter age:'), 10);
  if (!Number.isInteger(age)) return;
  await iDB.insert('user', { name, age });
};

document.getElementById('get').onclick = async () => {
  await iDB.readAll('user');
};

document.getElementById('update').onclick = async () => {
  const id = parseInt(prompt('Enter ID'), 10);
  if (!Number.isInteger(id)) return;
  await iDB.update('user', id);
};

document.getElementById('delete').onclick = async () => {
  const id = parseInt(prompt('Enter ID'), 10);
  if (!Number.isInteger(id)) return;
  await iDB.delete('user', id);
};

document.getElementById('adults').onclick = async () => {
  await iDB.read('user', { age: { greater: 18 } });
};
