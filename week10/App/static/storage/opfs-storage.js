import { AbstractStorage } from "./storage.js";

class OriginPrivateFileSystemError extends Error {
  constructor(action, cause) {
    super(cause.message);
    this.name = "OriginPrivateFileSystemError";
    this.action = action;
    this.cause = cause;
  }
}

class OPFSStorage extends AbstractStorage {
  #keepExistingData = false;
  #extName;

  constructor(connection, options = {}) {
    super(connection, options);
    this.#keepExistingData = options.keepExistingData || false;
    this.#extName = options.extName || "txt";
  }

  static async build(options = {}) {
    const fs = await navigator.storage.getDirectory();
    return new OPFSStorage(fs, options);
  }

  async insert(directory, key, content = null) {
    console.log(directory, key, content);
    try {
      const dir = await this.connection.getDirectoryHandle(directory, {
        create: true,
      });
      const fileHandle = await dir.getFileHandle(`${key}.${this.#extName}`, {
        create: true,
      });
      if (!content) return fileHandle;
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(content));
      await writable.close();
      return fileHandle;
    } catch (error) {
      console.log(error);
      console.log(error);
      const opfsError = new OriginPrivateFileSystemError("save", error);
      this.#handleError(opfsError);
    }
  }

  async readAll(directory) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory);
      return dir.entries();
    } catch (error) {
      console.log(error);
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async read(directory, file) {
    try {
      console.log("read single");
      const dir = await this.connection.getDirectoryHandle(directory);
      return await dir.getFileHandle(`${file}.${this.#extName}`);
    } catch (error) {
      console.log(error);
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async update(directory, file, content) {
    try {
      const dir = await this.connection.getDirectoryHandle(directory);
      const fileHandle = await dir.getFileHandle(`${file}.${this.#extName}`);
      const writable = await fileHandle.createWritable({
        keepExistingData: this.#keepExistingData,
      });
      const { size } = await fileHandle.getFile();
      await writable.write({
        type: "write",
        position: size,
        data: JSON.stringify(content),
      });
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
      return await dir.removeEntry(`${file}.${this.#extName}`);
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

export default OPFSStorage;
