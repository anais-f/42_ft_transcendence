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
	const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-500'
	const statusText = isOnline ? 'Online' : 'Offline'

	return /*html*/ `
    <li class="flex flex-row border-b border-black" id="friend_item_${id}">
      <div class="flex gap-4 py-2 px-4">
        <img src="${avatar}" alt="${username}'s avatar" class="w-12 h-12 object-cover border-black">
        <div>
          <a data-action="navigate-profile" data-username="${username}" data-id="${id}" class="cursor_pointer">
            <p class="font-medium hover:font-bold">${username}</p>
          </a>
          <p class="text-gray-500 flex items-center gap-2">
            <span id="status_circle_${id}" class="w-3 h-3 rounded-full ${statusColor}"></span>
            <span id="status_text_${id}">${statusText}</span>
          </p>
        </div>
      </div>
    </li>
    `
}
