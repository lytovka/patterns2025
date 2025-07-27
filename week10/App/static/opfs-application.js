import { OriginPrivateFileSystemWrapper } from "./opfs-api.js";

class Logger {
  #output;
  #file;
  #stream;

  constructor(outputId, file) {
    this.#output = document.getElementById(outputId);
    this.#file = file;
    return file.createWritable().then((stream) => {
      this.#stream = stream;
      return this;
    });
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    const data = lines.join(" ") + "\n";
    this.#output.textContent += data;
    this.#output.scrollTop = this.#output.scrollHeight;
    const { size } = this.#file;
    this.#stream.write({ type: "write", position: size, data });
  }

  static #serialize(x) {
    return typeof x === "object" ? JSON.stringify(x, null, 2) : x;
  }
}

// Usage
const directoryName = "Application";
const opfs = await OriginPrivateFileSystemWrapper.build();
const logFile = await opfs.insert(directoryName, "data.log", "");
console.log(logFile, opfs);
const logger = await new Logger("output", logFile);

opfs.addEventListener("log", (event) => {
  logger.log(event.detail);
});

opfs.addEventListener("error", (event) => {
  const error = event.detail.error;
  console.log(error);
  logger.log({ action: error.action, message: error.message });
});

document.getElementById("save-file").onclick = async () => {
  const data = window.prompt("Save file data");
  const fileHandle = await opfs.insert(directoryName, "data.txt", data);
  const file = await fileHandle.getFile();
  logger.log({ action: "save", content: await file.text() });
};

document.getElementById("open-file").onclick = async () => {
  const fileHandle = await opfs.read(directoryName, "data.txt");
  const file = await fileHandle.getFile();
  logger.log({ action: "open", content: await file.text() });
};

document.getElementById("update-file").onclick = async () => {
  const data = window.prompt("File data");
  const fileHandle = await opfs.update(directoryName, "data.txt", data);
  const file = await fileHandle.getFile();
  logger.log({ action: "update", content: await file.text() });
};

document.getElementById("delete-file").onclick = async () => {
  await opfs.delete(directoryName, "data.txt");
  logger.log({ action: "delete", fileName: "data.txt" });
};
