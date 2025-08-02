class ApplicationUtils {
  static validate(record, schema) {
    for (const [key, val] of Object.entries(record)) {
      const field = schema[key];
      const name = `Field ${key}`;
      if (!field) throw new Error(`${name} is not defined`);
      if (field.type === 'int') {
        if (Number.isInteger(val)) continue;
        throw new Error(`${name} expected to be integer`);
      } else if (field.type === 'str') {
        if (typeof val === 'string') continue;
        throw new Error(`${name} expected to be string`);
      }
    }
  }

  static sort(arr, order) {
    if (typeof order !== 'object') return;
    const rule = Object.entries(order)[0];
    if (!Array.isArray(rule)) return;
    const [field, dir = 'asc'] = rule;
    const sign = dir === 'desc' ? -1 : 1;
    arr.sort((a, b) => {
      const x = a[field];
      const y = b[field];
      if (x === y) return 0;
      return x > y ? sign : -sign;
    });
  }
}

class SchemaValidator {
  #schemas;

  constructor(schemas) {
    this.#schemas = schemas;
  }

  validate(record, schemaName) {
    const schema = this.#schemas[schemaName];
    if (!schema) throw Error(`No schema found for store ${store}`);
    this.#validate(record, schema);
  }

  #validate(record, schema) {
    for (const [key, val] of Object.entries(record)) {
      const field = schema[key];
      const name = `Field ${key}`;
      if (!field) throw new Error(`${name} is not defined`);
      if (field.type === 'int') {
        if (Number.isInteger(val)) continue;
        throw new Error(`${name} expected to be integer`);
      } else if (field.type === 'str') {
        if (typeof val === 'string') continue;
        throw new Error(`${name} expected to be string`);
      }
    }
  }
}

export { ApplicationUtils, SchemaValidator };
