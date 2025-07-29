interface AbstractStorageOptions {
  [key: string]: any;
}

export abstract class AbstractStorage<T = any> extends EventTarget {
  connection: any;
  options: AbstractStorageOptions;

  constructor(connection: any, options?: AbstractStorageOptions);

  static build<T>(
    options?: AbstractStorageOptions,
  ): Promise<AbstractStorage<T>>;

  /**
   * Insert a record.
   */
  insert(container: string, id: string | number, content: any): Promise<T>;

  /**
   * Read all records from a container.
   */
  readAll(container: string): Promise<T[]>;

  /**
   * Read a single record from a container by ID.
   */
  read(container: string, id: string | number): Promise<T>;

  /**
   * Update a record by ID.
   */
  update(container: string, id: string | number, content: any): Promise<T>;

  /**
   * Delete a record by ID.
   */
  delete(container: string, id: string | number): Promise<undefined>;
}
