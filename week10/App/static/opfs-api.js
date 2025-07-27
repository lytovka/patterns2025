class OriginPrivateFileSystemError extends Error {
  constructor(action, cause) {
    super(cause.message);
    this.name = "OriginPrivateFileSystemError";
    this.action = action;
    this.cause = cause;
  }

  // static #getUserErrorMessage(action, error) {
  //   const errorMessageMap = {
  //     AbortError:
  //       "The picker operation was not successful because it was aborted by the user.",
  //     SecurityError: `There was security concerns for action '${action}'.`,
  //     TypeError: `Cannot process accept types. Please make sure the listed MIME types are correct.`,
  //     NotFoundError: `Action '${action}' cannot be completed because file or directory does not exist.`,
  //   };
  //   return (
  //     errorMessageMap[error.name] ||
  //     `Could not complete action '${action}' in Origin Private File System.`
  //   );
  // }
}

class StorageWrapper extends EventTarget {
  constructor(connection, options = {}) {
    if (new.target === StorageWrapper) {
      throw new Error("Cannot instantiate abstract class StorageWrapper");
    }
    super();
    this.connection = connection;
    this.options = options;
  }

  async insert(store, content) {
    throw new Error("Abstract method 'insert' must be implemented by subclass");
  }

  async readAll(store) {
    throw new Error(
      "Abstract method 'readAll' must be implemented by subclass",
    );
  }

  async read(store, id) {
    throw new Error("Abstract method 'read' must be implemented by subclass");
  }

  async update(store, record) {
    throw new Error("Abstract method 'update' must be implemented by subclass");
  }

  async delete(store, id) {
    throw new Error("Abstract method 'update' must be implemented by subclass");
  }
}

class OriginPrivateFileSystemWrapper extends StorageWrapper {
  #keepExistingData = false;

  constructor(connection, options = {}) {
    super(connection, options);
    this.#keepExistingData = options.keepExistingData || false;
  }

  static async build(options = {}) {
    const fs = await navigator.storage.getDirectory();
    return new OriginPrivateFileSystemWrapper(fs, options);
  }

  async insert(directory, file, content = null) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory, {
        create: true,
      });
      const fileHandle = await dir.getFileHandle(file, {
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

  async readAll(directory) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory);
      return dir.entries();
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async read(directory, file) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory);
      return await dir.getFileHandle(file);
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async update(directory, file, content) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory);
      const fileHandle = await dir.getFileHandle(file);
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

  async delete(directory, file) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory);
      return await dir.removeEntry(file);
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

export { OriginPrivateFileSystemWrapper };
