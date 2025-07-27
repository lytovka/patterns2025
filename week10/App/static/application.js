import IndexedDbWrapper from "./indexedb.js";
import Logger from "./logger.js";

const logger = new Logger("output");
const db = await IndexedDbWrapper.build({
  name: "Application",
  version: 1,
  keyPath: "id",
  autoIncrement: true,
});

db.addEventListener("log", (event) => {
  logger.log(event.detail);
});

document.getElementById("add").onclick = async () => {
  const name = prompt("Enter user name:");
  if (!name) return;
  const age = parseInt(prompt("Enter age:"), 10);
  if (!Number.isInteger(age)) return;
  await db.insert("user", undefined, { name, age });
};

document.getElementById("get").onclick = async () => {
  await db.readAll("user");
};

document.getElementById("update").onclick = async () => {
  const id = parseInt(prompt("Enter user id:"));
  const record = await db.read("user", id);
  await db.update("user", record.id, { ...record, age: record.age + 1 });
};

document.getElementById("delete").onclick = async () => {
  const id = prompt("Enter user id:");
  await db.delete("user", id);
};

document.getElementById("adults").onclick = () => {};
