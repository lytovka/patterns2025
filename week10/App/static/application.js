import IndexedDbStorage from "./storage/indexedb-storage.js";
import OPFSStorage from "./storage/opfs-storage.js";

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
  console.log("add", result);
};

document.getElementById("get").onclick = async () => {
  const result = await storage.readAll("user");
  let data = [];
  if (!usingIndexedDB) {
    for await (const entry of result) {
      data.push(entry[0]);
    }
  } else {
    data = result;
  }
  console.log("get", data);
};

document.getElementById("get-single").onclick = async () => {
  const id = prompt("Enter user id:");
  const result = await storage.read("user", id);
  console.log("get single", result);
};

document.getElementById("update").onclick = async () => {
  const id = prompt("Enter user id:");
  const record = await storage.read("user", id);
  let content = record;
  if (!usingIndexedDB) {
    const file = await record.getFile();
    console.log(await file.text());
    content = JSON.parse(await file.text());
    console.log("OPFS content to update", content);
  }
  const result = await storage.update("user", id, {
    ...content,
    age: content.age + 1,
  });
  console.log("update", result);
};

document.getElementById("delete").onclick = async () => {
  const id = prompt("Enter user id:");
  await storage.delete("user", id);
  console.log("delete", id);
};
