import { AbstractStorage, AbstractStorageOptions } from "./storage";

export default class OPFSStorage extends AbstractStorage<FileSystemHandle> {
  static build(options?: AbstractStorageOptions): Promise<OPFSStorage>;

  /**
   * Insert a file into a directory. Returns the FileSystemFileHandle if successful, or undefined if content is not provided.
   */
  insert(
    directory: string,
    key: string | number,
    content?: any,
  ): Promise<FileSystemFileHandle | undefined>;

  /**
   * Returns an array of file names in the directory.
   */
  readAll(directory: string): Promise<string[]>;

  /**
   * Returns the FileSystemFileHandle for a file, or undefined on error.
   */
  read(
    directory: string,
    file: string,
  ): Promise<FileSystemFileHandle | undefined>;

  /**
   * Update file contents. Returns the FileSystemFileHandle, or undefined on error.
   */
  update(
    directory: string,
    file: string,
    content: any,
  ): Promise<FileSystemFileHandle | undefined>;

  /**
   * Delete a file. Returns void or any value from the directory.removeEntry() implementation.
   */
  delete(directory: string, file: string): Promise<void>;
}
