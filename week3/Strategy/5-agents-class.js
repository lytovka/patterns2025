'use strict';

class Strategy {
  constructor(strategyName, actions) {
    this.strategyName = strategyName
    this.actions = actions
    this.agents = new Map()
  }

  registerBehavior(implementationName, behaviour) {
    const agent = {}
    for (const [key, action] of Object.entries(behaviour)) {
      if (!this.actions.includes(key)) throw new Error(`Action ${key} is not supported in ${this.strategyName}`)
      if (typeof action !== 'function') throw new Error(`Action ${key} expected to be function`)
      agent[key] = action
    }
    this.agents.set(implementationName, agent)
  }

  getBehaviour(implementationName, actionName) {
    const agent = this.#getAgent(implementationName)
    const handler = agent[actionName]
    if (!handler) throw new Error(`Strategy '${this.strategyName}' does not implement '${actionName}' in implementation '${implementationName}'`)
    return handler
  }

  #getAgent(name) {
    const agent = this.agents.get(name)
    if (!agent) throw new Error(`Strategy ${name} not found`)
    return agent
  }

}

// Usage

const strategy = new Strategy("notifications", ["notify", "multicast"])

strategy.registerBehavior("email", {
  notify: (to, message) => {
    console.log(`Sending "email" notification to <${to}>`);
    console.log(`message length: ${message.length}`);
  },
  multicast: (message) => {
    console.log(`Sending "email" notification to all`);
    console.log(`message length: ${message.length}`);
  },
})

strategy.registerBehavior('sms', {
  notify: (to, message) => {
    console.log(`Sending "sms" notification to <${to}>`);
    console.log(`message length: ${message.length}`);
  },
  multicast: (message) => {
    console.log(`Sending "sms" notification to all`);
    console.log(`message length: ${message.length}`);
  },
});

const notify = strategy.getBehaviour('sms', 'notify');
notify('+380501234567', 'Hello world');
