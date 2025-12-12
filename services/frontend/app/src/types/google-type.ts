export {}

declare global {
  interface Window {
    navigate: (url: string, skipAuth?: boolean) => void
  }
}
// TODO ????


declare global {
	interface Window {
		google: {
			accounts: {
				id: {
					initialize: (config: {
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
					prompt: (momentNotification?: (notification: any) => void) => void
				}
			}
		}
	}
}

export interface CredentialResponse {
	credential: string
	select_by: string
}
