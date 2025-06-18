'use strict';
import fs from 'node:fs';

// Task: implement a cancelable promise by passing `timeout: number`
// as an option to the promisified function (last argument,
// replacing the callback).

const promisify = (fn, options) => (...args) => {
  const timeout = options.timeout || 1000
  const promise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Timeout to resolve exceeded"))
      return
    }, timeout)
    const callback = (err, data) => {
      if (err) reject(err);
      else resolve(data);
      clearTimeout(timeoutId)
    };
    fn(...args, callback);
  });
  return promise;
};

// Usage

const read = promisify(fs.readFile, { timeout: 1 });

const main = async () => {
  const fileName = '1-promisify-solution.js';
  const data = await read(fileName, 'utf8');
  console.log(`File "${fileName}" size: ${data.length}`);
};

main();
