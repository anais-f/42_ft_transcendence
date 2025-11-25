/*
sendFriendRequest(userId, friendId) — validate + call addRelation()
acceptFriendRequest(userId, friendId) — check permissions + call updateRelationStatus()
declineFriendRequest(userId, friendId) — check permissions + call deleteRelation()
removeFriend(userId, friendId) — check permissions + call deleteRelation()
getFriendsList(userId) — call findFriendsList()
getPendingRequests(userId) — call findPendingListToApprove() + findPendingSentRequests()
 */
