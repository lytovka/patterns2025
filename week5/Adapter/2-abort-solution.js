'use strict';
import fs from 'node:fs';

// Task: implement cancellation by passing `AbortSignal` as an option
// to the promisified function (last argument, replacing the callback).
// Hint: Create `AbortController` or `AbortSignal` in the usage section.

const promisify = (fn, options) => (...args) => {
  const timeout = options.timeout || 1000
  const controller = options.controller
  const promise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      controller.abort("Timeout exceeded")
    }, timeout)

    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error(controller.signal.reason));
    });

    const callback = (err, data) => {
      clearTimeout(timeoutId)
      if (err) reject(err);
      else resolve(data);
    };
    fn(...args, callback);
  });
  return promise;
};

// Usage
const controller = new AbortController()
const read = promisify(fs.readFile, { timeout: 1, controller });

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
