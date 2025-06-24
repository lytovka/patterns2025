'use strict';
import fs from 'node:fs';

// Task: implement cancellation by passing `AbortSignal` as an option
// to the promisified function (last argument, replacing the callback).
// Hint: Create `AbortController` or `AbortSignal` in the usage section.

const promisify = (fn, options) => (...args) => {
  const { timeout = 1000, signal: externalSignal } = options
  const timer = AbortSignal.timeout(timeout)
  const signal = AbortSignal.any([timer, externalSignal])
  const promise = new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => {
      reject(new Error("timeout exceeded"));
    });

    const callback = (err, data) => {
      if (err) reject(err);
      else resolve(data);
    };
    fn(...args, callback);
  });
  return promise;
};

// Usage
const read = promisify(fs.readFile, { timeout: 100, signal: AbortSignal.timeout(1) });

const main = async () => {
  const fileName = '2-abort-solution.js';
  try {
    const data = await read(fileName, 'utf8');
    console.log(`File "${fileName}" size: ${data.length}`);
  } catch (err) {
    console.error(err)
  }
};

main();
