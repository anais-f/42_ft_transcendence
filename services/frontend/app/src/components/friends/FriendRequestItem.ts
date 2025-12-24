import { Button } from '../Button.js'
import { UserLink } from '../UserLink.js'

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
		  ${UserLink({ id, username })}
          <div id="request_buttons" class="flex gap-4">
          	${Button({
							id: 'accept_friend_btn',
							text: 'Accept',
							type: 'button',
							action: 'accept-friend',
							additionalClasses: 'friend_btn',
							dataAttributes: `data-id="${id}"`
						})}
						${Button({
							id: 'decline_friend_btn',
							text: 'Decline',
							type: 'button',
							action: 'decline-friend',
							additionalClasses: 'friend_btn',
							dataAttributes: `data-id="${id}"`
						})}
          </div>
        </div>
      </div>
    </li>
  `
}
