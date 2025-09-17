import { AbstractStorage, AbstractStorageOptions } from "./storage";

export default class IndexedDbStorage extends AbstractStorage {
  static build(options?: AbstractStorageOptions): Promise<IndexedDbStorage>;

  /**
   * Insert a record into the object store.
   * Correction: The code resolves with the record, which is the content argument.
   */
  insert(storeName: string, id: string | number, record: any): Promise<any>;

  /**
   * Returns all records in the object store as an array.
   */
  readAll(storeName: string): Promise<any[]>;

  /**
   * Returns a single record by id, or rejects if not found.
   * Correction: Strictly speaking, this should be Promise<any>, as you reject on missing.
   */
  read(storeName: string, id: string | number): Promise<any>;

  /**
   * Update a record by id.
   */
  update(storeName: string, id: string | number, content: any): Promise<any>;

  /**
   * Delete a record by id. Returns the deleted record or error.
   * Correction: Returns the deleted record (from the read promise) or resolves with an error.
   */
  delete(storeName: string, id: string | number): Promise<undefined>;
}
