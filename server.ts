import { asyncUtils } from './deps.ts'

export async function fetchUsernameIsAvailable(username: string) {
	await asyncUtils.delay(1000)

	return !username.includes('a')
}
