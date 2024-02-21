import { hookForm } from './deps.ts'
import { React } from './deps.ts'
import { fetchUsernameIsAvailable } from './server.ts'

interface FormState {
	usernames: string[]
}

export function Root() {
	const form = hookForm.useForm<FormState>({ defaultValues: { usernames: [''] } })
	const usernames = hookForm.useWatch({ control: form.control, name: 'usernames' })
	const statuses = useUsernamesStatus(usernames)

	return (
		<div className='h-full flex items-center justify-center'>
			<div>
				{usernames.map((_, index) => {
					const isAvailable = statuses[index]

					return (
						<div key={index}>
							<label htmlFor='name' className='block font-bold text-dark-30 dark:text-light-30'>Username</label>
							<input
								className='border-dark-10 dark:border-light-10 focus:border-primary border-2 rounded outline-none px-10 py-6'
								{...form.register(`usernames.${index}`)}
							/>

							{isAvailable ? <p className='text-success'>Available!</p> : <p className='text-danger'>Username Taken</p>}
						</div>
					)
				})}

				<button onClick={() => form.setValue('usernames', [...usernames, ''])}>Add Username</button>
			</div>
		</div>
	)
}

function useUsernamesStatus(usernames: string[]) {
	const knownStatuses = React.useRef(new Map<string, boolean>())
	const unknownUsernames = usernames.filter((username) => !knownStatuses.current.has(username))

	React.useEffect(() => {
		Promise.all(usernames.map((username) => fetchUsernameIsAvailable(username).then((status) => ({ username, status })))).then(
			(statuses) => {
				for (const { username, status } of statuses) {
					knownStatuses.current.set(username, status)
				}
			},
		)
	}, [unknownUsernames.join(',')])

	return usernames.map((username) => knownStatuses.current.get(username) || false)
}

// Imagine that `Root` started out allowing only one username, then iteration was later added to allow multiple usernames
// ... this hook would have to be entirely re-written. Not a big deal for the size that it is, but if this was scaled 40x,
// it would notate a drastic refactor
function useUsernameStatus(username: string) {
	const [status, setStatus] = React.useState(false)

	React.useEffect(() => {
		let wasCanceled = false

		fetchUsernameIsAvailable(username).then((status) => {
			if (!wasCanceled) setStatus(status)
		})

		return () => {
			wasCanceled = true
		}
	}, [username])

	return status
}
