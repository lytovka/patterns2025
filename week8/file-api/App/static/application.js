class Logger {
  #output;

  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    this.#output.textContent += lines.join(" ") + "\n";
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  static #serialize(x) {
    return typeof x === "object" ? JSON.stringify(x, null, 2) : x;
  }
}

const logger = new Logger("output");

document.getElementById("get").onclick = () => {};

document.getElementById("update").onclick = () => {};

document.getElementById("delete").onclick = () => {};

document.getElementById("adults").onclick = () => {};
