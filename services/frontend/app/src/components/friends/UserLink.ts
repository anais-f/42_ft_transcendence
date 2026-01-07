/**
 * Renders a clickable link to a user's profile with hover effect.
 * @param props - The properties of the user link.
 * @param props.id - The unique identifier of the user.
 * @param props.username - The username to display.
 * @param props.fontSize - Optional font size (default: 'base').
 * @param props.additionalClasses - Optional additional CSS classes for the text.
 * @returns The HTML string representing the user link.
 */
interface UserLinkProps {
	id: string
	username: string
	fontSize?: 'sm' | 'base' | 'lg' | 'xl' | 'xxl'
	additionalClasses?: string
}

const fontSizeClasses: Record<string, string> = {
	sm: 'text-sm',
	base: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	xxl: 'text-2xl'
}

export const UserLink = (props: UserLinkProps): string => {
	const { id, username, fontSize = 'base', additionalClasses = '' } = props
	const fontClass = fontSizeClasses[fontSize]

	return /*html*/ `
    <a data-action="navigate-profile" data-username="${username}" data-id="${id}" class="cursor_pointer">
      <p class="font-medium hover:font-bold truncate min-w-0 ${fontClass} ${additionalClasses}">${username}</p>
    </a>
  `
}
