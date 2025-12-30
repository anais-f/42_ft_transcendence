import { UserLink } from '../UserLink.js'
import { StatusCircle } from './StatusCircle.js'
import { escapeHtml, sanitizeAvatarUrl } from '../../usecases/sanitize.js'

/**
 * Renders a friend list item.
 * @param props - The properties of the friend list item.
 * @param props.id - The unique identifier of the friend.
 * @param props.username - The username of the friend.
 * @param props.avatar - The URL of the friend's avatar image.
 * @param props.status - The online status of the friend ('online' or 'offline').
 * @returns The HTML string representing the friend list item.
 */
interface FriendListItemProps {
	id: string
	username: string
	avatar: string
	status: number
}

/**
 * FriendListItem component
 * @param props
 * @constructor
 */
export const FriendListItem = (props: FriendListItemProps): string => {
	const { id, username, avatar, status } = props

	const isOnline = status === 1
	const statusText = isOnline ? 'Online' : 'Offline'

	// Sanitize user inputs
	const safeAvatar = sanitizeAvatarUrl(avatar)
	const safeUsername = escapeHtml(username)

	return /*html*/ `
    <li class="flex flex-row border-b border-black" id="friend_item_${id}">
      <div class="flex gap-4 py-2 px-4">
        <!-- User's avatar -->
        <img src="${safeAvatar}" alt="${safeUsername}'s avatar" class="w-12 h-12 object-cover border-black">
        <div>
          <!-- User's link -->
          ${UserLink({ id, username })}
          <p class="text-gray-500 flex items-center gap-2">
            ${StatusCircle({ isOnline, id: `status_circle_${id}` })}
            <span id="status_text_${id}">${statusText}</span>
          </p>
        </div>
      </div>
    </li>
  `
}
