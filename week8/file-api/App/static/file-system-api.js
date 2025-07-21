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

export default FileSystemApiWrapper;
