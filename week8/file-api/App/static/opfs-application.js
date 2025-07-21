class Logger {
  #output;
  #file;
  #stream;

  constructor(outputId, file) {
    this.#output = document.getElementById(outputId);
    this.#file = file;
    console.log(file);
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

class OriginPrivateFileSystemError extends Error {
  constructor(action, cause) {
    super(OriginPrivateFileSystemError.#getUserErrorMessage(action, cause));
    this.name = "OriginPrivateFileSystemError";
    this.action = action;
    this.cause = cause;
  }

  static #getUserErrorMessage(action, error) {
    const errorMessageMap = {
      AbortError:
        "The picker operation was not successful because it was aborted by the user.",
      SecurityError: `There was security concerns for action '${action}'.`,
      TypeError: `Cannot process accept types. Please make sure the listed MIME types are correct.`,
      NotFoundError: `Action '${action}' cannot be completed because file or directory does not exist.`,
    };
    return (
      errorMessageMap[error.name] ||
      `Could not complete action '${action}' in Origin Private File System.`
    );
  }
}

class OriginPrivateFileSystemWrapper extends EventTarget {
  #fs;
  #keepExistingData = false;

  constructor(fs, options = {}) {
    super();
    this.#fs = fs;
    this.#keepExistingData = options.keepExistingData || false;
  }

  static async build(options = {}) {
    const fs = await navigator.storage.getDirectory();
    return new OriginPrivateFileSystemWrapper(fs, options);
  }

  async save(storeName, content = null) {
    try {
      const fileHandle = await this.#fs.getFileHandle(storeName, {
        create: true,
      });
      if (!content) return fileHandle;
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return fileHandle;
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("save", error);
      this.#handleError(opfsError);
    }
  }

  async read(storeName) {
    try {
      return await this.#fs.getFileHandle(storeName);
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async update(storeName, content) {
    try {
      const fileHandle = await this.#fs.getFileHandle(storeName);
      const writable = await fileHandle.createWritable({
        keepExistingData: this.#keepExistingData,
      });
      const { size } = await fileHandle.getFile();
      await writable.write({ type: "write", position: size, data: content });
      await writable.close();
      return fileHandle;
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("update", error);
      this.#handleError(opfsError);
    }
  }

  async delete(storeName) {
    try {
      await this.#fs.removeEntry(storeName);
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("delete", error);
      this.#handleError(opfsError);
    }
  }

  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  #handleError(error) {
    this.#emit("error", { error });
  }
}

// Usage
const opfs = await OriginPrivateFileSystemWrapper.build();
const logFile = await opfs.save("data.log", "");
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
  const fileHandle = await opfs.save("data.txt", data);
  const file = await fileHandle.getFile();
  logger.log({ action: "save", content: await file.text() });
};

document.getElementById("open-file").onclick = async () => {
  const fileHandle = await opfs.read("data.txt");
  const file = await fileHandle.getFile();
  logger.log({ action: "open", content: await file.text() });
};

document.getElementById("update-file").onclick = async () => {
  const data = window.prompt("File data");
  const fileHandle = await opfs.update("data.txt", data);
  const file = await fileHandle.getFile();
  logger.log({ action: "update", content: await file.text() });
};

document.getElementById("delete-file").onclick = async () => {
  await opfs.delete("data.txt");
  logger.log({ action: "delete", fileName: "data.txt" });
};
