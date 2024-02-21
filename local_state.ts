import { React } from './deps.ts'

export interface LocalState<T> {
	state: T
	updater: Updater
}

export function useLocalState<State, Engine extends LocalState<State>>(creator: () => Engine): Engine {
	const machine = React.useRef<Engine | null>(null)
	if (!machine.current) machine.current = creator()

	const [_, setCount] = React.useState(0)

	React.useEffect(() => {
		if (!machine.current) throw new Error('expected a state machine')

		machine.current.updater.onUpdate(() => {
			if (!machine.current) throw new Error('expected a state machine')

			setCount((count) => {
				return count + 1
			})
		})
	}, [])

	return classToHigherOrderFunction(machine.current)
}

function classToHigherOrderFunction<C>(class_: C): C {
	if (typeof class_ !== 'object' || class_ === null || class_ === undefined) throw new Error('expected an object')

	const res = { ...class_ } as Record<string, unknown>

	// @ts-ignore check is below
	const prototype = Object.getPrototypeOf(class_)

	if (prototype) {
		for (const field of Object.getOwnPropertyNames(prototype)) {
			const value = prototype[field]

			if (typeof value === 'function' && field !== 'constructor') {
				res[field] = (...args: unknown[]) => {
					value.bind(class_)(...args)
				}
			}
		}
	}

	return res as C
}

export class Updater {
	#listeners = new Set<VoidFunction>()

	onUpdate(listener: VoidFunction): VoidFunction {
		this.#listeners.add(listener)

		return () => this.#listeners.delete(listener)
	}

	update() {
		for (const fn of this.#listeners) fn()
	}
}
