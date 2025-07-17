class Logger {
  #output;

  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    this.#output.textContent += lines.join(" ") + "\n";
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  static #serialize(x) {
    return typeof x === "object" ? JSON.stringify(x, null, 2) : x;
  }
}

// polyfill
function withResolvers() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

class FileSystemApiWrapper extends EventTarget {
  #options = {};

  constructor(options = {}) {
    super();
    this.#options = options;
  }

  static init(options = {}) {
    return new FileSystemApiWrapper(options);
  }

  async save(content) {
    const handle = await this.#getWriteFileSystemFileHandle();
    console.log(handle);
    const writableStream = await handle.createWritable();
    await writableStream.write({ type: "write", data: content });
    await writableStream.close();
    this.#emit("log", { action: "save", fileName: handle.name });
    return true;
  }

  async read() {
    const [handle] = await this.#getReadFileSystemFileHandle();
    const fileData = await handle.getFile();
    const { promise, resolve, reject } = withResolvers();
    const reader = new FileReader();
    reader.onerror = (error) => {
      this.#emit({ action: "read", data: { error } });
      reject(error);
    };
    reader.onload = () => {
      this.#emit("log", {
        action: "read",
        data: { fileName: fileData.name, content: reader.result },
      });
      resolve();
    };
    reader.readAsText(fileData);

    return promise;
  }

  async update(content) {
    const [handle] = await this.#getReadFileSystemFileHandle();
    const writableStream = await handle.createWritable({
      keepExistingData: true,
    });
    writableStream.write({ type: "write", data: content });
    await writableStream.close();
    const file = await handle.getFile();
    this.#emit("log", { action: "update", data: { fileName: file.name } });
  }

  async delete(fileName) {
    const handle = await this.#getFileSystemDirectoryHandle();
    await handle.removeEntry(fileName);
    this.#emit("log", { action: "delete", data: { fileName } });
  }

  async #getReadFileSystemFileHandle() {
    return await window.showOpenFilePicker(this.#options);
  }

  async #getWriteFileSystemFileHandle() {
    return await window.showSaveFilePicker(this.#options);
  }

  async #getFileSystemDirectoryHandle() {
    return await window.showDirectoryPicker(this.#options);
  }

  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

// Usage
const pickerOpts = {
  types: [
    {
      description: "Text",
      accept: {
        "text/plain": [".txt"],
      },
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false,
  startIn: "desktop",
};
const fileSystemApi = FileSystemApiWrapper.init(pickerOpts);

const logger = new Logger("output");

fileSystemApi.addEventListener("log", (event) => {
  logger.log(event.detail);
});

document.getElementById("save-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApi.save(content);
};

document.getElementById("open-file").onclick = async () => {
  await fileSystemApi.read();
};

document.getElementById("update-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApi.update(content);
};

document.getElementById("delete-file").onclick = async () => {
  const fileName = window.prompt("Enter file name to delete");
  await fileSystemApi.delete(fileName);
};
