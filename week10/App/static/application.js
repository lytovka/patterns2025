import IndexedDbStorage from "./storage/indexedb-storage.js";
import OPFSStorage from "./storage/opfs-storage.js";
import Logger from "./logger.js";

const logger = new Logger("output");

class StorageContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  insert(container, key, value) {
    return this.strategy.insert(container, key, value);
  }
  read(container, key) {
    return this.strategy.read(container, key);
  }
  update(container, key, value) {
    return this.strategy.update(container, key, value);
  }
  delete(container, key) {
    return this.strategy.delete(container, key);
  }
  readAll(container) {
    return this.strategy.readAll(container);
  }
}

const indexedb = await IndexedDbStorage.build({
  name: "Application",
  version: 1,
  keyPath: "id",
  autoIncrement: true,
});

const opfs = await OPFSStorage.build();

const storage = new StorageContext(indexedb);

indexedb.addEventListener("log", (event) => {
  logger.log(event);
});
opfs.addEventListener("log", (event) => {
  logger.log(event);
});

let usingIndexedDB = true;
const toggleBtn = document.getElementById("switch-storage");
const label = document.getElementById("storage-value");

toggleBtn.addEventListener("click", () => {
  if (usingIndexedDB) {
    label.textContent = "OPFS";
    storage.setStrategy(opfs);
    usingIndexedDB = false;
  } else {
    label.textContent = "Indexed DB";
    storage.setStrategy(indexedb);
    usingIndexedDB = true;
  }
});

document.getElementById("add").onclick = async () => {
  const id = prompt("Enter user id:");
  if (!id) return;
  const name = prompt("Enter user name:");
  if (!name) return;
  const age = parseInt(prompt("Enter age:"), 10);
  if (!Number.isInteger(age)) return;
  const result = await storage.insert("user", id, { name, age });
  console.log(result);
};

document.getElementById("get").onclick = async () => {
  await storage.readAll("user");
};

document.getElementById("get-single").onclick = async () => {};

document.getElementById("update").onclick = async () => {
  const id = prompt("Enter user id:");
  const record = await storage.read("user", id);
  await storage.update("user", record.id, { ...record, age: record.age + 1 });
};

document.getElementById("delete").onclick = async () => {
  const id = prompt("Enter user id:");
  await storage.delete("user", id);
};
