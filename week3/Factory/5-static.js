"use strict";

class PersonFactory {
  static getPerson(name) {
    return new Person(name);
  }
}

class Person {
  constructor(name) {
    this.name = name;
  }
}

// Usage

const p1 = PersonFactory.getPerson("Marcus");
console.dir({ p1 });

const p2 = PersonFactory.getPerson("Marcus");
console.dir({ p2 });
