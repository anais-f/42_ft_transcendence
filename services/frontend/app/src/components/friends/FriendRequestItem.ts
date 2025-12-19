/**
 * Renders a friend request item.
 * @param props - The properties of the friend request item.
 * @param props.id - The unique identifier of the friend request.
 * @param props.username - The username of the requester.
 * @param props.avatar - The URL of the requester's avatar image.
 * @returns The HTML string representing the friend request item.
 */
interface FriendRequestItemProps {
	id: string
	username: string
	avatar: string
}

/**
 * FriendRequestItem component
 * @param props
 * @constructor
 */
export const FriendRequestItem = (props: FriendRequestItemProps): string => {
	const { id, username, avatar } = props

	return /*html*/ `
    <li class="flex border-b border-black" id="friend_request_item_${id}">
      <div class="flex gap-4 py-2 px-4">
        <img src="${avatar}" alt="${username}'s avatar" class="w-12 h-12 object-cover border-black">
        <div id="username_and_buttons" class="flex-1">
          <a data-action="navigate-profile" data-username="${username}" data-id="${id}">
            <p class="font-medium">${username}</p>
          </a>
          <div id="request_buttons" class="flex gap-4">
            <button id="accept_friend_btn_${id}" type="button" class="friend_btn">Accept</button>
            <button id="decline_friend_btn_${id}" type="button" class="friend_btn">Decline</button>
          </div>
        </div>
      </div>
    </li>
  `
}
