import { asyncUtils, React } from './deps.ts'
import { LocalState, Updater, useLocalState } from './local_state.ts'
import { fetchUsernameIsAvailable } from './server.ts'

export type UsernameStatus = 'undecided' | 'loading' | 'available' | 'taken'

export interface UsernameDefinition {
	name: string
	status: UsernameStatus
}

export interface State {
	usernames: UsernameDefinition[]
}

export class Engine implements LocalState<State> {
	updater = new Updater()
	state: State = { usernames: [{ name: '', status: 'undecided' }] }

	#cancelCurrentTask: VoidFunction | null = null

	// If the original constraints of this project were to have only one username, this engine would meet those demands easily
	// Just convert the state types to allow multiple usernames and add this function
	addUsername() {
		this.state.usernames.push({ name: '', status: 'undecided' })
		this.updater.update()
	}

	updateUsername(index: number, updated: string) {
		this.state.usernames[index].name = updated

		this.state.usernames[index].status = !updated.length ? 'undecided' : 'loading'
		this.updater.update()

		if (updated.length) this.#runTask((signal) => this.#updateStatus(index, signal))
	}

	#runTask(task: (signal: AbortSignal) => void) {
		if (this.#cancelCurrentTask) this.#cancelCurrentTask()

		const controller = new AbortController()
		this.#cancelCurrentTask = () => controller.abort()

		task(controller.signal)
	}

	async #updateStatus(index: number, signal: AbortSignal) {
		await asyncUtils.delay(500)
		if (signal.aborted) return

		const username = this.state.usernames[index].name
		if (!username.length) return

		const isAvailable = await fetchUsernameIsAvailable(username)
		if (signal.aborted) return

		this.state.usernames[index].status = isAvailable ? 'available' : 'taken'
		this.updater.update()
	}
}

export function Root() {
	const { state, addUsername, updateUsername } = useLocalState(() => new Engine())

	return (
		<div className='h-full flex items-center justify-center'>
			<div className='flex flex-col gap-10'>
				{state.usernames.map((definition, index) => {
					// NOTE: notice how the input value is not set. This is not ideal, but is done for the sake of simplicity
					// Ideally, input would be a child component that contains a ref to the real input. When the component re-renders, `value` would be set, but
					// it would be allowed to change freely between renders.
					//
					// This removes the need to re-render the entire component on every keystroke, but retains `Engine's` ability to modify the usernames graphically

					return (
						<div key={index}>
							<label htmlFor='name' className='block font-bold text-dark-30 dark:text-light-30'>Username</label>
							<input
								className='border-dark-10 dark:border-light-10 focus:border-primary border-2 rounded outline-none px-10 py-6'
								onInput={(event) => updateUsername(index, event.currentTarget.value)}
							/>

							<div className='h-20'>
								<UsernameStatusView status={definition.status} />
							</div>
						</div>
					)
				})}

				<button className='font-bold text-primary hover:text-primary-80 transition-colors' onClick={() => addUsername()}>
					Add Username
				</button>
			</div>
		</div>
	)
}

interface UsernameStatusViewParams {
	status: UsernameStatus
}

function UsernameStatusView(params: UsernameStatusViewParams) {
	if (params.status === 'undecided') return <></>
	if (params.status === 'loading') return <p className='text-dark-30 dark:text-light-30'>Checking availability...</p>
	if (params.status === 'available') return <p className='text-danger'>Username taken</p>

	return <p className='text-success'>Available!</p>
}
