/*

- on(name, f, timeout = 0)
- удаление событие через remove созданных через once
- distinct() - метод переключает emitter в режим уникальных обработчиков
- names() : array of string - возвращаем все имена
- listeners(name): array of function - возвращает копию массива подписок

- has(name) : boolean - существуют ли обработчики
- has(name, f): boolean - есть ли функция f в массиве обработчиков
- prepend(name, f) - устанавливает обработчик перед всеми остальными
- insert(name, f, g) - устанавливает обработчик f перед g

------------------

- wrapper, EventEmitter, mixin
- wrapper, factory, prototype
- factory, mixin, functor
- prototype, functor, class
- mixin, class, factory
*/

const emitter = () => {
	let events = {};
	const ee = {
		on: (name, f, timeout = 0) => {
			const event = events[name] || [];
			events[name] = event;
			event.push(f);
			if (timeout) setTimeout(() => {
				ee.remove(name, f);
			}, timeout);
		},
		emit: (name, ...data) => {
			const event = events[name];
			if (event) event.forEach(f => f(...data));
		},
		once: (name, f) => {
			const g = (...a) => {
				ee.remove(name, g);
				f(...a);
			};
			ee.on(name, g);
		},
		remove: (name, f) => {
			const event = events[name];
			if (!event) return;
			const i = event.indexOf(f);
			event.splice(i, 1);
		},
		clear: (name) => {
			if (name) events[name] = [];
			else events = {};
		},
		count: (name) => {
			const event = events[name];
			return event ? event.length : 0;
		},
		listeners: (name) => {
			const event = events[name];
			return event.slice();
		},
		distinct: () => {

		},
		names: () => Object.keys(events),
		has: (name) => Boolean(events[name]),
		has: (name, fn) => {
			const event = events[name]
			return Boolean(event && event.some(curr => curr === fn))
		}
	};
	return ee;
};

// Usage

const ee = emitter();

// on and emit

ee.on('e1', (data) => {
	console.dir(data);
});

ee.emit('e1', { msg: 'e1 ok' });

// once

ee.once('e2', (data) => {
	console.dir(data);
});

ee.emit('e2', { msg: 'e2 ok' });
ee.emit('e2', { msg: 'e2 not ok' });

// remove

const f3 = (data) => {
	console.dir(data);
};

ee.on('e3', f3);
ee.remove('e3', f3);
ee.emit('e3', { msg: 'e3 not ok' });

// count

const noop = () => { }
ee.on('e4', noop);
ee.on('e4', noop);
console.log('e4 count', ee.count('e4'));

// clear

ee.clear('e4');
ee.emit('e4', { msg: 'e4 not ok' });
ee.emit('e1', { msg: 'e1 ok' });

ee.clear();
ee.emit('e1', { msg: 'e1 not ok' });

// listeners and names

ee.on('e5', noop);
ee.on('e5', noop);
ee.on('e6', noop);
ee.on('e7', noop);

console.log('listeners', ee.listeners('e5'));
console.log('names', ee.names());
console.log("has ", ee.has("e5"), ee.has("e8"))
console.log("has function", ee.has("e5", noop), ee.has("e2", noop))
