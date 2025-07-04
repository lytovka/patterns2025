'use strict';

class StrategyError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StrategyError';
    }
}

class Strategy {
  #strategyName
  #actions = []
  #agents = new Map()

  constructor(strategyName, actions) {
    this.#strategyName = strategyName
    this.#actions = actions
  }

  registerBehavior(implementationName, behaviour) {
    const agent = {}
    for (const [key, action] of Object.entries(behaviour)) {
      if (!this.#actions.includes(key)) throw new StrategyError(`Action '${key}' is not supported in ${this.#strategyName}`)
      if (typeof action !== 'function') throw new StrategyError(`Action '${key}' expected to be function`)
      agent[key] = action
    }
    this.#agents.set(implementationName, agent)
  }

  getBehaviour(agentName, actionName) {
    const agent = this.#getAgent(agentName)
    const behavior = agent[actionName]
    if (!behavior) throw new StrategyError(`Agent ${agentName} of strategy '${this.#strategyName}' does not implement '${actionName}''`)
    return behavior
  }

  #getAgent(name) {
    const agent = this.#agents.get(name)
    if (!agent) throw new StrategyError(`Strategy ${name} not found`)
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
