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
  constructor(action, cause) {
    super(FileSystemApiError.#getUserErrorMessage(action, cause));
    this.name = "FileSystemApiError";
    this.action = action;
    this.cause = cause;
  }

  static #getUserErrorMessage(action, error) {
    const errorMessageMap = {
      AbortError:
        "The picker operation was not successful because it was aborted by the user.",
      SecurityError: `There was security concerns for action '${action}'.`,
      TypeError: `Cannot process accept types. Please make sure the listed MIME types are correct.`,
      // TODO: add more File System API related errors
    };
    return (
      errorMessageMap[error.name] ||
      `Could not complete action '${action}' in File System API.`
    );
  }
}

class FileSystemApiWrapper extends EventTarget {
  #options = {};

  constructor(options = {}) {
    super();
    this.#options = options;
  }

  async save(content) {
    try {
      const handle = await this.#getWriteFileSystemFileHandle();
      const writableStream = await handle.createWritable();
      await writableStream.write({ type: "write", data: content });
      await writableStream.close();
      this.#emit("log", { action: "save", fileName: handle.name });
    } catch (error) {
      const fileSystemError = new FileSystemApiError("save", error);
      this.#handleError(fileSystemError);
    }
  }

  async read() {
    try {
      const [handle] = await this.#getReadFileSystemFileHandle();
      return await handle.getFile();
    } catch (error) {
      const fileSystemError = new FileSystemApiError("read", error);
      this.#handleError(fileSystemError);
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
      const fileSystemError = new FileSystemApiError("update", error);
      this.#handleError(fileSystemError);
    }
  }

  async delete(fileName) {
    try {
      const handle = await this.#getFileSystemDirectoryHandle();
      await handle.removeEntry(fileName);
      this.#emit("log", { action: "delete", data: { fileName } });
    } catch (error) {
      const fileSystemError = new FileSystemApiError("delete", error);
      this.#handleError(fileSystemError);
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

  #handleError(error) {
    this.#emit("error", { error });
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
const fileSystemApiWrapper = new FileSystemApiWrapper(pickerOpts);

const logger = new Logger("output");

fileSystemApiWrapper.addEventListener("log", (event) => {
  logger.log(event.detail);
});

fileSystemApiWrapper.addEventListener("error", (event) => {
  const error = event.detail.error;
  logger.log({ action: error.action, message: error.message });
});

document.getElementById("save-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApiWrapper.save(content);
};

document.getElementById("open-file").onclick = async () => {
  try {
    const file = await fileSystemApiWrapper.read();
    logger.log({
      action: "read",
      fileName: file.name,
      content: await file.text(),
    });
  } catch (error) {}
};

document.getElementById("update-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApiWrapper.update(content);
};

document.getElementById("delete-file").onclick = async () => {
  const fileName = window.prompt("Enter file name to delete");
  await fileSystemApiWrapper.delete(fileName);
};
