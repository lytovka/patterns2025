"use strict";
import fs from "node:fs";

// Task: implement a cancelable promise by passing `timeout: number`
// as an option to the promisified function (last argument,
// replacing the callback).

const promisify =
  (fn, options) =>
  (...args) => {
    const timeout = options.timeout ?? 1000;
    let isExpired = false;
    // todo: try Promise.withResolvers(...)
    const promise = new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        if (isExpired) return;
        reject(new Error("Timeout to resolve exceeded"));
        timer = null;
      }, timeout);
      const callback = (err, data) => {
        if (isExpired) return;
        if (timer) clearTimeout(timer);
        if (err) reject(err);
        else resolve(data);
      };
      fn(...args, callback);
    });
    return promise.finally(() => {
      isExpired = true;
    });
  };

// Usage

const read = promisify(fs.readFile, { timeout: 5 });

const main = async () => {
  const fileName = "1-promisify-solution.js";
  const data = await read(fileName, "utf8");
  console.log(`File "${fileName}" size: ${data.length}`);
};

main();
