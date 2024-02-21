import { asserts } from './deps.ts'
import { Engine } from './organic.tsx'

Deno.test('ensure a username is added', () => {
	const engine = new Engine()

	engine.addUsername()

	asserts.assertEquals(engine.state.usernames.length, 2)
})
