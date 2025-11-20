/*
sendFriendRequest(userId, friendId) — valide + appelle addRelation()
acceptFriendRequest(userId, friendId) — vérifie permissions + appelle updateRelationStatus()
declineFriendRequest(userId, friendId) — vérifie permissions + appelle deleteRelation()
removeFriend(userId, friendId) — vérifie permissions + appelle deleteRelation()
getFriendsList(userId) — appelle findFriendsList()
getPendingRequests(userId) — appelle findPendingListToApprove() + findPendingSentRequests()
 */

