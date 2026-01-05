export interface CredentialResponse {
	credential: string
	select_by: string
}

export interface NavigateOptions {
	skipAuth?: boolean
	delay?: number
}

declare global {
	interface Window {
		navigate: (url: string, options?: NavigateOptions) => void
		cancelPendingNavigation: () => void

		google: {
			accounts: {
				// fonctionnality related to Google Accounts
				id: {
					// functionality related to One Tap and Sign In With Google
					initialize: (config: {
						// initialization of the Google Sign-In client
						client_id: string
						callback: (response: CredentialResponse) => void
						auto_select?: boolean
						cancel_on_tap_outside?: boolean
					}) => void
					renderButton: (
						parent: HTMLElement,
						options: {
							type?: 'standard' | 'icon'
							theme?: 'outline' | 'filled_blue' | 'filled_black'
							size?: 'large' | 'medium' | 'small'
							text?: 'signin_with' | 'signup_with' | 'continue_with'
							shape?: 'rectangular' | 'pill' | 'circle'
							logo_alignment?: 'left' | 'center'
							width?: string
						}
					) => void
					prompt: (momentNotification?: (notification: any) => void) => void // display the One Tap prompt for popup
				}
			}
		}
	}
}

export {}
