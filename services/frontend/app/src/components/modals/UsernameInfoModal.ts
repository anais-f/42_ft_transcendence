import { Modal } from './Modal.js'

export const USERNAME_INFO_MODAL_ID = 'username-info-modal'

interface UsernameInfoModalProps {
	login: string
	username: string
}

export const UsernameInfoModal = (props: UsernameInfoModalProps): string => {
	const { login, username } = props

	const content = /*html*/ `
		<div class="space-y-4">
			<p class="text-sm">
				Your <b>login</b> (used to sign in) and your <b>username</b> (displayed publicly):
			</p>
			<div class="bg-black/5 p-3 rounded border border-black/20">
				<p>
					<span class="inline-block w-64 text-sm uppercase tracking-wider text-black/70">Login (for authentication)</span>
					<span class="font-normal text-lg">${login}</span>
				</p>
			</div>
			<div class="bg-black/5 p-3 rounded border border-black/20">
				<p>
					<span class="inline-block w-64 text-sm uppercase tracking-wider text-black/70">Username (public display)</span>
					<span class="font-normal text-lg">${username}</span>
				</p>
			</div>
			<p class="text-xs text-black/60">
				${login !== username ? `Your username was incremented because "${login}" was already taken.` : 'These are the same for now.'} You can change your username later in settings.
			</p>
		</div>
	`
	return Modal({
		id: USERNAME_INFO_MODAL_ID,
		title: 'Welcome!',
		subtitle: 'Important Information',
		content
	})
}
