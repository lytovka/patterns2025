"use strict";

// Task: refactor `Timer` to make the event name configurable
// (e.g., 'step' in the example) and not hardcoded into the `Timer`.
// Hint: You need Node.js >= v19.0.0

class Timer extends EventTarget {
  #counter = 0;
  #intervalId;
  name;

  constructor(delay, name) {
    super();
    this.name = name;
    this.#intervalId = setInterval(() => {
      const step = this.#counter++;
      const data = { detail: { step } };
      const event = new CustomEvent(this.name, data);
      this.dispatchEvent(event);
    }, delay);
  }

  close() {
    clearInterval(this.#intervalId);
  }
}

// Usage

const timer = new Timer(1000, "my-event");

timer.addEventListener(timer.name, (event) => {
  console.log({ event, detail: event.detail });
});

setTimeout(() => timer.close(), 3000);
