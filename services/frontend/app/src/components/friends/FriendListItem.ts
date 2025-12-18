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
	status: 'online' | 'offline'
}

/**
 * FriendListItem component
 * @param props
 * @constructor
 */
export const FriendListItem = (props: FriendListItemProps): string => {
	const { id, username, avatar, status = '' } = props

	const statusColor = status === 'online' ? 'bg-green-500' : 'bg-gray-500'

	return /*html*/ `
    <li class="flex flex-row border-b border-black" id="friend_item_${id}">
      <div class="flex gap-4 py-2 px-4">
        <img src="${avatar}" alt="${username}'s avatar" class="w-12 h-12 object-cover border-black">
        <div>
          <a data-action="navigate-profile" data-username="${username}" data-id="${id}">
            <p class="font-medium">${username}</p>
          </a>  
          <p class="text-gray-500 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full ${statusColor}"></span>
            ${status}
          </p>
        </div>
      </div>
    </li>
    `
}
