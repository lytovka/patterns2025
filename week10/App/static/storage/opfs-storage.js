class OriginPrivateFileSystemError extends Error {
  constructor(action, cause) {
    super(cause.message);
    this.name = "OriginPrivateFileSystemError";
    this.action = action;
    this.cause = cause;
  }
}

/**
 * @implements {AbstractStorage<FileSystemHandle>}
 */
class OPFSStorage {
  #connection;
  #options;

  constructor(connection, options = {}) {
    const defaultOptions = { keepExistingData: true, extName: "txt" };
    this.#connection = connection;
    this.#options = { defaultOptions, ...options };
  }

  static async build(options = {}) {
    const fs = await navigator.storage.getDirectory();
    return new OPFSStorage(fs, options);
  }

  async insert(directory, key, content = null) {
    const { extName } = this.#options;
    try {
      const dir = await this.#connection.getDirectoryHandle(directory, {
        create: true,
      });
      const fileHandle = await dir.getFileHandle(`${key}.${extName}`, {
        create: true,
      });
      if (!content) return fileHandle;
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(content));
      await writable.close();
      return fileHandle;
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("save", error);
      this.#handleError(opfsError);
    }
  }

  async readAll(directory) {
    try {
      const dir = await this.#connection.getDirectoryHandle(directory);
      return dir.entries();
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async read(directory, file) {
    const { extName } = this.#options;
    try {
      const dir = await this.#connection.getDirectoryHandle(directory);
      return await dir.getFileHandle(`${file}.${extName}`);
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("read", error);
      this.#handleError(opfsError);
    }
  }

  async update(directory, file, content) {
    const { keepExistingData, extName } = this.#options;
    try {
      const dir = await this.#connection.getDirectoryHandle(directory);
      const fileHandle = await dir.getFileHandle(`${file}.${extName}`);
      const writable = await fileHandle.createWritable({
        keepExistingData,
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
    const { extName } = this.#options;
    try {
      const dir = await this.#connection.getDirectoryHandle(directory);
      return await dir.removeEntry(`${file}.${extName}`);
    } catch (error) {
      const opfsError = new OriginPrivateFileSystemError("delete", error);
      this.#handleError(opfsError);
    }
  }

  #handleError(error) {
    console.error(error);
  }
}

export default OPFSStorage;
