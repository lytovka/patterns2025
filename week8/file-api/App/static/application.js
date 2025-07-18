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

class FileSystemApiError extends Error {
  constructor(action, message, cause) {
    super(message);
    this.name = "FileSystemApiError";
    this.action = action;
    if (cause) this.cause = cause;
  }
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
    try {
      const handle = await this.#getWriteFileSystemFileHandle();
      const writableStream = await handle.createWritable();
      await writableStream.write({ type: "write", data: content });
      await writableStream.close();
      this.#emit("log", { action: "save", fileName: handle.name });
    } catch (error) {
      throw this.#handleError("save", error, "Failed to save file");
    }
  }

  async read() {
    try {
      const [handle] = await this.#getReadFileSystemFileHandle();
      return await handle.getFile();
    } catch (error) {
      throw this.#handleError("read", error, "Failed to read file");
    }
  }

  async update(content) {
    try {
      const [handle] = await this.#getReadFileSystemFileHandle();
      const writableStream = await handle.createWritable();
      await writableStream.write({ type: "write", data: content });
      await writableStream.close();
      const file = await handle.getFile();
      this.#emit("log", { action: "update", data: { fileName: file.name } });
    } catch (error) {
      throw this.#handleError("update", error, "Failed to update file");
    }
  }

  async delete(fileName) {
    try {
      const handle = await this.#getFileSystemDirectoryHandle();
      await handle.removeEntry(fileName);
      this.#emit("log", { action: "delete", data: { fileName } });
    } catch (error) {
      throw this.#handleError("delete", error, "Failed to delete file");
    }
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

  #handleError(action, error, customMessage = null) {
    const message =
      customMessage || `Failed during ${action}: ${error.message}`;
    const wrappedError = new FileSystemApiError(action, message, error);
    this.#emit("error", { action, error: wrappedError });
    return wrappedError;
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

fileSystemApi.addEventListener("error", (event) => {
  logger.log(event.detail);
});

document.getElementById("save-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApi.save(content);
};

document.getElementById("open-file").onclick = async () => {
  const file = await fileSystemApi.read();
  logger.log({
    action: "read",
    fileName: file.name,
    content: await file.text(),
  });
};

document.getElementById("update-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApi.update(content);
};

document.getElementById("delete-file").onclick = async () => {
  const fileName = window.prompt("Enter file name to delete");
  await fileSystemApi.delete(fileName);
};
